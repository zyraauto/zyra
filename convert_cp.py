import csv

input_file = 'cpdescarga.txt'
output_file = 'postal_codes.csv'

print("Procesando el catálogo de códigos postales...")

try:
    with open(input_file, mode='r', encoding='latin-1') as infile, \
         open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
        
        reader = csv.reader(infile, delimiter='|')
        writer = csv.writer(outfile)
        
        # Cabecera limpia que coincide con la tabla postal_codes de Supabase
        writer.writerow(['cp', 'asentamiento', 'municipio', 'estado', 'ciudad'])
        
        count = 0
        for row in reader:
            # Omitir líneas vacías, comentarios iniciales o la cabecera original de Correos de México
            if not row or len(row) < 6:
                continue
            if row[0] == 'd_codigo' or not row[0].isdigit():
                continue
            
            cp = row[0].strip()
            asentamiento = row[1].strip()
            municipio = row[3].strip()
            estado = row[4].strip()
            ciudad = row[5].strip() if len(row) > 5 else ''
            
            writer.writerow([cp, asentamiento, municipio, estado, ciudad])
            count += 1

    print(f"¡Conversión exitosa! Se procesaron {count} registros.")
    print(f"Archivo generado: {output_file}")

except FileNotFoundError:
    print(f"Error: No se encontró el archivo '{input_file}' en la raíz del proyecto.")