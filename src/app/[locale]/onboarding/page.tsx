"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { CircleNotchIcon, WrenchIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ThemeToggle from "@/components/ThemeToggle";
import { provisionTenant, type ProvisionTenantField } from "@/app/actions/workshop";
import { useAuthStore } from "@/stores/auth.store";

type FormState = {
  name: string;
  slug: string;
  phone: string;
  postalCode: string; // va a workshops.postal_code
  colony: string; // solo UI: se une a la dirección (calle + colonia) al enviar
  address: string; // calle y número
  city: string;
  state: string;
  ownerFirstName: string;
  ownerLastName: string;
};

type FieldErrors = Partial<Record<ProvisionTenantField, string>>;
type CpStatus = "idle" | "loading" | "ok" | "error";
// Respuesta de /api/cp/:cp (ver route.ts): éxito { error:false, ... } o fallo { error:true, manual:true }.
type CpResponse =
  | { error: false; cp: string; estado: string; municipio: string; ciudad: string; colonias: string[] }
  | { error: true; code?: string; manual?: boolean };

const MANUAL_COLONY = "__manual__";

const INITIAL_FORM: FormState = {
  name: "",
  slug: "",
  phone: "",
  postalCode: "",
  colony: "",
  address: "",
  city: "",
  state: "",
  ownerFirstName: "",
  ownerLastName: "",
};

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Estilos del UI Kit de Zyra (las variantes dark: obedecen a data-theme vía @custom-variant en globals.css)
const INPUT_CLS =
  "h-11 rounded-xl border-zinc-200 bg-zinc-100 text-zinc-900 placeholder:text-zinc-400 " +
  "focus-visible:border-red-600 focus-visible:ring-1 focus-visible:ring-red-600 focus-visible:ring-offset-0 " +
  "dark:border-zinc-800 dark:bg-[#15151E] dark:text-white dark:placeholder:text-zinc-500 " +
  "dark:focus-visible:border-red-600 dark:focus-visible:ring-red-600";

// Mismo aspecto que INPUT_CLS pero para <select> nativo.
const SELECT_CLS =
  "h-11 w-full rounded-xl border border-zinc-200 bg-zinc-100 px-3 text-sm text-zinc-900 outline-none " +
  "focus-visible:border-red-600 focus-visible:ring-1 focus-visible:ring-red-600 disabled:opacity-60 " +
  "dark:border-zinc-800 dark:bg-[#15151E] dark:text-white dark:focus-visible:border-red-600 dark:focus-visible:ring-red-600";

// "Taller Hermanos López" -> "taller-hermanos-lopez"
function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
}

// Mientras el usuario escribe el subdominio no se recortan los guiones finales (si no, no podría teclear "-").
function sanitizeSlugInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "")
    .slice(0, 40);
}

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (form.name.trim().length < 2) errors.name = "Escribe el nombre de tu taller.";
  const slug = form.slug.replace(/^-+|-+$/g, "");
  if (slug.length < 3 || !SLUG_RE.test(slug)) {
    errors.slug = "Usa 3 a 40 caracteres: letras minúsculas, números y guiones.";
  }
  if (form.postalCode && form.postalCode.length !== 5) {
    errors.postalCode = "El código postal debe tener 5 dígitos.";
  }
  if (!form.ownerFirstName.trim()) errors.ownerFirstName = "Escribe tu nombre.";
  if (!form.ownerLastName.trim()) errors.ownerLastName = "Escribe tus apellidos.";
  return errors;
}

// "Calle 5 #12, Col. Centro" (el código postal ya NO va aquí: se envía aparte y se guarda en su columna).
function buildAddress(form: FormState): string {
  return [form.address.trim(), form.colony.trim() ? `Col. ${form.colony.trim()}` : ""]
    .filter(Boolean)
    .join(", ");
}

export default function OnboardingPage() {
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  const user = useAuthStore((s) => s.user);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const refreshTenant = useAuthStore((s) => s.refreshTenant);
  const signOut = useAuthStore((s) => s.signOut);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cpStatus, setCpStatus] = useState<CpStatus>("idle");
  const [colonias, setColonias] = useState<string[]>([]);
  // true cuando el usuario eligió "Otra (escribir a mano)" en el <select> de colonias.
  const [manualColony, setManualColony] = useState(false);
  const prefilled = useRef(false);

  // Carga el usuario en el store si aún no está (entrada directa a /onboarding o tras Google OAuth).
  useEffect(() => {
    if (!useAuthStore.getState().user) void fetchProfile();
  }, [fetchProfile]);

  // Precarga nombre y apellidos desde el proveedor (Google). user_metadata se usa solo para mostrar, nunca para autorizar.
  useEffect(() => {
    if (!user || prefilled.current) return;
    prefilled.current = true;
    const meta = user.user_metadata as Record<string, unknown> | undefined;
    const raw = typeof meta?.full_name === "string" ? meta.full_name : typeof meta?.name === "string" ? meta.name : "";
    const [first = "", ...rest] = raw.trim().split(/\s+/).filter(Boolean);
    setForm((f) => ({
      ...f,
      ownerFirstName: f.ownerFirstName || first,
      ownerLastName: f.ownerLastName || rest.join(" "),
    }));
  }, [user]);

  // Al completar los 5 dígitos del C.P., consulta /api/cp/:cp y rellena estado, ciudad y colonias.
  // Todo sigue siendo editable: si la consulta falla o no existe, el formulario queda en captura manual.
  useEffect(() => {
    const cp = form.postalCode;
    setManualColony(false);

    if (cp.length !== 5) {
      setColonias([]);
      setCpStatus("idle");
      return;
    }

    const ctrl = new AbortController();
    setCpStatus("loading");

    fetch(`/api/cp/${cp}`, { signal: ctrl.signal })
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as CpResponse | null;
        if (!res.ok || !data || data.error) throw new Error(`cp_${res.status}`);
        return data;
      })
      .then((info) => {
        setColonias(info.colonias);
        setForm((f) => ({
          ...f,
          city: info.ciudad || info.municipio || f.city,
          state: info.estado || f.state,
          colony:
            info.colonias.length === 1
              ? info.colonias[0]
              : info.colonias.includes(f.colony)
                ? f.colony
                : "",
        }));
        setCpStatus("ok");
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setColonias([]);
        setCpStatus("error");
      });

    return () => ctrl.abort();
  }, [form.postalCode]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onNameChange = (value: string) => {
    setForm((f) => ({ ...f, name: value, slug: slugTouched ? f.slug : slugify(value) }));
    setErrors((e) => ({ ...e, name: undefined, ...(slugTouched ? {} : { slug: undefined }) }));
  };

  const onColonySelect = (value: string) => {
    if (value === MANUAL_COLONY) {
      setManualColony(true);
      setField("colony", "");
    } else {
      setField("colony", value);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    setFormError(null);
    const localErrors = validate(form);
    setErrors(localErrors);
    if (Object.keys(localErrors).length > 0) return;

    setBusy(true);
    try {
      // 1) Servidor: crea el taller y escribe app_metadata.tenant_id + role.
      const result = await provisionTenant({
        name: form.name,
        slug: form.slug.replace(/^-+|-+$/g, ""),
        ownerFirstName: form.ownerFirstName,
        ownerLastName: form.ownerLastName,
        phone: form.phone,
        address: buildAddress(form),
        postalCode: form.postalCode,
        city: form.city,
        state: form.state,
      });

      if (!result.success) {
        if (result.field) setErrors({ [result.field]: result.error });
        else setFormError(result.error);
        setBusy(false);
        return;
      }

      // 2) Cliente: renueva el JWT para que traiga el tenant_id nuevo (refreshSession) y resincroniza el store
      //    (fetchProfile). Sin esto, las políticas RLS que leen auth.jwt() rechazarían al usuario.
      const synced = await refreshTenant();
      if (!synced) {
        setFormError(
          "Tu taller se creó, pero no pudimos actualizar tu sesión. Pulsa de nuevo el botón para continuar; no se duplicará."
        );
        setBusy(false);
        return;
      }

      // 3) Listo: al ERP. (busy sigue en true hasta que cambie la ruta.)
      router.replace(`/${locale}/workshop/dashboard`);
      router.refresh();
    } catch (err) {
      console.error("[onboarding] error inesperado:", err);
      setFormError("Ocurrió un error inesperado. Intenta de nuevo.");
      setBusy(false);
    }
  };

  const onSignOut = async () => {
    setBusy(true);
    await signOut();
    router.replace(`/${locale}/login`);
  };

  const slugPreview = form.slug.replace(/^-+|-+$/g, "") || "tu-taller";

  const cpHint =
    cpStatus === "loading"
      ? "Buscando tu código postal…"
      : cpStatus === "ok"
        ? "Estado, ciudad y colonia completados. Puedes editarlos."
        : cpStatus === "error"
          ? "No encontramos ese código postal. Escribe estado, ciudad y colonia a mano."
          : "Escribe 5 dígitos y completamos estado, ciudad y colonia.";

  const showColonySelect = colonias.length > 1 && !manualColony;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3F3F5] p-4 py-10 text-zinc-900 transition-colors dark:bg-[#15151E] dark:text-[#F3F3F5]">
      {/* La tarjeta es `relative` y aloja el selector de tema en su esquina superior derecha */}
      <div className="relative mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white/90 p-8 text-zinc-900 shadow-xl backdrop-blur transition-colors dark:border-zinc-800 dark:bg-[#292B33]/90 dark:text-[#F3F3F5] dark:shadow-black/40">
        <div className="absolute right-4 top-4 z-10 text-zinc-700 dark:text-zinc-200">
          <ThemeToggle />
        </div>

        <header className="mb-8 space-y-4 pr-12">
          <div className="flex size-11 items-center justify-center rounded-xl bg-red-600/10 text-red-600 dark:bg-red-600/20 dark:text-red-500">
            <WrenchIcon className="size-6" weight="bold" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-[#F3F3F5]">
              Registra tu taller
            </CardTitle>
            <CardDescription className="text-zinc-600 dark:text-zinc-400">
              Un último paso para entrar a Zyra. Podrás cambiar estos datos más adelante.
            </CardDescription>
          </div>
        </header>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
          {/* ---------- Tu taller ---------- */}
          <fieldset className="flex flex-col gap-4" disabled={busy}>
            <legend className="mb-1 text-sm font-semibold text-zinc-900 dark:text-[#F3F3F5]">Tu taller</legend>

            <Field id="name" label="Nombre del taller" error={errors.name}>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Taller Hermanos López"
                autoComplete="organization"
                className={INPUT_CLS}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
            </Field>

            <Field
              id="slug"
              label="Subdominio"
              error={errors.slug}
              hint={`Ingresarás a ${slugPreview}.zyra.app`}
            >
              <div className="flex">
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setField("slug", sanitizeSlugInput(e.target.value));
                  }}
                  onBlur={() => setField("slug", form.slug.replace(/-+$/, ""))}
                  placeholder="taller-hermanos-lopez"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  className={`${INPUT_CLS} rounded-r-none`}
                  aria-invalid={Boolean(errors.slug)}
                  aria-describedby={errors.slug ? "slug-error" : "slug-hint"}
                />
                <span className="flex items-center rounded-r-xl border border-l-0 border-zinc-200 bg-zinc-200/70 px-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-400">
                  .zyra.app
                </span>
              </div>
            </Field>

            <Field id="phone" label="Teléfono (opcional)">
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="961 123 4567"
                autoComplete="tel"
                className={INPUT_CLS}
              />
            </Field>

            {/* Dirección, en orden de captura: C.P. -> estado y ciudad -> colonia -> calle */}
            <Field id="postalCode" label="Código postal (opcional)" error={errors.postalCode} hint={cpHint}>
              <div className="relative">
                <Input
                  id="postalCode"
                  value={form.postalCode}
                  onChange={(e) => setField("postalCode", e.target.value.replace(/\D/g, "").slice(0, 5))}
                  placeholder="30000"
                  inputMode="numeric"
                  maxLength={5}
                  autoComplete="postal-code"
                  className={INPUT_CLS}
                  aria-invalid={Boolean(errors.postalCode)}
                  aria-describedby={errors.postalCode ? "postalCode-error" : "postalCode-hint"}
                />
                {cpStatus === "loading" && (
                  <CircleNotchIcon className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-zinc-400" />
                )}
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="state" label="Estado (opcional)">
                <Input
                  id="state"
                  value={form.state}
                  onChange={(e) => setField("state", e.target.value)}
                  placeholder="Chiapas"
                  autoComplete="address-level1"
                  className={INPUT_CLS}
                />
              </Field>
              <Field id="city" label="Ciudad o municipio (opcional)">
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  placeholder="Tuxtla Gutiérrez"
                  autoComplete="address-level2"
                  className={INPUT_CLS}
                />
              </Field>
            </div>

            <Field id="colony" label="Colonia (opcional)">
              {showColonySelect ? (
                <select
                  id="colony"
                  value={form.colony}
                  onChange={(e) => onColonySelect(e.target.value)}
                  className={SELECT_CLS}
                >
                  <option value="">Selecciona tu colonia</option>
                  {colonias.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value={MANUAL_COLONY}>Otra (escribir a mano)</option>
                </select>
              ) : (
                <>
                  <Input
                    id="colony"
                    value={form.colony}
                    onChange={(e) => setField("colony", e.target.value)}
                    placeholder="Centro"
                    autoComplete="off"
                    className={INPUT_CLS}
                  />
                  {colonias.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setManualColony(false);
                        setField("colony", "");
                      }}
                      className="self-start text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                    >
                      Elegir de la lista
                    </button>
                  )}
                </>
              )}
            </Field>

            <Field id="address" label="Calle y número (opcional)">
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                placeholder="Av. Central Poniente 123"
                autoComplete="address-line1"
                className={INPUT_CLS}
              />
            </Field>
          </fieldset>

          {/* ---------- Tus datos ---------- */}
          <fieldset className="flex flex-col gap-4" disabled={busy}>
            <legend className="mb-1 text-sm font-semibold text-zinc-900 dark:text-[#F3F3F5]">
              Tus datos (responsable del taller)
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="ownerFirstName" label="Nombre" error={errors.ownerFirstName}>
                <Input
                  id="ownerFirstName"
                  value={form.ownerFirstName}
                  onChange={(e) => setField("ownerFirstName", e.target.value)}
                  autoComplete="given-name"
                  className={INPUT_CLS}
                  aria-invalid={Boolean(errors.ownerFirstName)}
                  aria-describedby={errors.ownerFirstName ? "ownerFirstName-error" : undefined}
                />
              </Field>
              <Field id="ownerLastName" label="Apellidos" error={errors.ownerLastName}>
                <Input
                  id="ownerLastName"
                  value={form.ownerLastName}
                  onChange={(e) => setField("ownerLastName", e.target.value)}
                  autoComplete="family-name"
                  className={INPUT_CLS}
                  aria-invalid={Boolean(errors.ownerLastName)}
                  aria-describedby={errors.ownerLastName ? "ownerLastName-error" : undefined}
                />
              </Field>
            </div>
          </fieldset>

          {formError && (
            <div
              role="alert"
              className="rounded-xl border border-red-600/40 bg-red-600/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400"
            >
              {formError}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              size="lg"
              disabled={busy}
              className="h-auto w-full rounded-xl bg-red-600 py-3 font-semibold text-white shadow-lg transition-all hover:bg-red-700 active:bg-[#A80703] disabled:opacity-70"
            >
              {busy ? (
                <>
                  <CircleNotchIcon className="size-4 animate-spin" />
                  Creando tu taller…
                </>
              ) : (
                "Crear mi taller"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              disabled={busy}
              className="text-zinc-600 hover:bg-transparent hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-transparent dark:hover:text-white"
            >
              Usar otra cuenta
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-zinc-800 dark:text-zinc-200">
        {label}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}