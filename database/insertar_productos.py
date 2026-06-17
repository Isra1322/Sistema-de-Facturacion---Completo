import pyodbc
import random

conn = pyodbc.connect(
    'DRIVER={ODBC Driver 18 for SQL Server};'
    'SERVER=localhost,1433;'
    'DATABASE=SistemaFacturacionDB;'
    'UID=sa;'
    'PWD=TuPassword123!;'
    'TrustServerCertificate=yes;'
)
cursor = conn.cursor()

categorias = ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Juguetes', 'Libros', 'Salud', 'Automotriz']

print("🚀 Insertando 100,000 productos...")

for i in range(1, 100001):
    precio = round(random.uniform(5, 5000), 2)
    stock = random.randint(0, 500)
    
    cursor.execute("""
        INSERT INTO Productos (Nombre, Precio, Stock, Estado, Categoria, AplicaIva, PorcentajeIva)
        VALUES (?, ?, ?, 'Activo', ?, 1, 15)
    """,
        f"Producto_{i}",
        precio,
        stock,
        random.choice(categorias)
    )
    
    if i % 5000 == 0:
        conn.commit()
        print(f"✅ {i} productos insertados...")

conn.commit()
print("🎉 ¡100,000 productos insertados con éxito!")

cursor.close()
conn.close()