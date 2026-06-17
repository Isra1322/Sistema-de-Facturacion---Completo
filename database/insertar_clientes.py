import pyodbc
from faker import Faker
import random
import re

fake = Faker('es_ES')
conn = pyodbc.connect(
    'DRIVER={ODBC Driver 18 for SQL Server};'
    'SERVER=localhost,1433;'
    'DATABASE=SistemaFacturacionDB;'
    'UID=sa;'
    'PWD=TuPassword123!;'
    'TrustServerCertificate=yes;'
)
cursor = conn.cursor()

print("🚀 Insertando 100,000 clientes...")

# Limpiar tabla primero
cursor.execute("DELETE FROM Clientes;")
conn.commit()
print("🗑️ Tabla de clientes limpiada")

correos_usados = set()

def generar_telefono_ecuador():
    # Genera teléfono válido: 09 + 8 dígitos
    return f"09{random.randint(10000000, 99999999)}"

def limpiar_texto(texto):
    # Eliminar caracteres raros y limitar longitud
    texto = re.sub(r'[^\w\s\u00C0-\u00FF\-\.]', '', texto)
    return texto[:100] if len(texto) > 100 else texto

for i in range(1, 100001):
    # Generar correo único
    while True:
        correo = fake.email()
        if correo not in correos_usados:
            correos_usados.add(correo)
            break
    
    nombre = limpiar_texto(fake.first_name())
    apellido = limpiar_texto(fake.last_name())
    direccion = limpiar_texto(fake.address())
    telefono = generar_telefono_ecuador()
    
    try:
        cursor.execute("""
            INSERT INTO Clientes (Nombre, Apellido, Direccion, Telefono, Correo, Estado)
            VALUES (?, ?, ?, ?, ?, 'Activo')
        """, nombre, apellido, direccion, telefono, correo)
        
    except Exception as e:
        print(f"Error en registro {i}: {e}")
        continue
    
    if i % 5000 == 0:
        conn.commit()
        print(f"✅ {i} clientes insertados...")

conn.commit()
print("🎉 ¡100,000 clientes insertados con éxito!")

# Verificar
cursor.execute("SELECT COUNT(*) FROM Clientes;")
count = cursor.fetchone()[0]
print(f"📊 Total en base de datos: {count} clientes")

cursor.close()
conn.close()