import time
import httpx

TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJncm91cCI6MywiaWF0IjoxNzQ2NTYxMjgxLCJleHAiOjE3NDY1NjMwODF9.qUvJIvSiqcgBKnYgVuF9vwTC5eALq-z2ap3RfbK6XF8"
BASE_URL = "https://dev.proyecto.2025-1.tallerdeintegracion.cl/starlink-factory"
HEADERS = {"Authorization": TOKEN}

SKUS = ["PCB-BAS", "ALU-PURO", "VIDRIO-AER", "MICRO-BAS"]
ORIGIN_SPACES = ["67f5c75a7763d08f07085a7a", "67f5c75a7763d08f07085a7e"]
DESTINATION_SPACE = "67f5c75a7763d08f07085a7d"


def request_con_reintento(metodo, url, **kwargs):
    while True:
        resp = metodo(url, headers=HEADERS, **kwargs)
        if resp.status_code == 429:
            print("⏳ Límite de peticiones alcanzado. Esperando 20 segundos...")
            time.sleep(20)
        else:
            return resp


def obtener_productos(store_id, sku):
    url = f"{BASE_URL}/spaces/{store_id}/products"
    params = {"sku": sku, "limit": 199}
    resp = request_con_reintento(httpx.get, url, params=params)
    if resp.status_code == 200:
        return resp.json()
    else:
        print(
            f"❌ Error al obtener productos ({sku} en {store_id}): {resp.status_code} - {resp.text}")
        return []


def mover_producto(product_id):
    url = f"{BASE_URL}/products/{product_id}"
    json_body = {"store": DESTINATION_SPACE}
    resp = request_con_reintento(httpx.patch, url, json=json_body)
    if resp.status_code == 200:
        print(f"✅ Producto {product_id} movido correctamente.")
    else:
        print(
            f"❌ Error al mover {product_id}: {resp.status_code} - {resp.text}")


def main():
    for sku in SKUS:
        for store in ORIGIN_SPACES:
            print(f"🔍 Buscando productos SKU {sku} en espacio {store}...")
            productos = obtener_productos(store, sku)
            if not productos:
                print(f"ℹ️ No hay productos para SKU {sku} en espacio {store}")
                continue
            for producto in productos:
                mover_producto(producto["_id"])


if __name__ == "__main__":
    main()
