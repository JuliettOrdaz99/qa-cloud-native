import os

import pytest
import requests
from pytest_bdd import scenarios, given, when, then, parsers


BASE_URL = os.getenv("BASE_URL", "http://localhost:3000")

scenarios("../features/productos.feature")


@pytest.fixture
def api_context():
    return {}


@given("la API de la tienda está disponible")
def api_disponible(api_context):
    response = requests.get(f"{BASE_URL}/health", timeout=5)

    assert response.status_code == 200
    api_context["health"] = response.json()


@when("consulto el catálogo de productos")
def consultar_productos(api_context):
    response = requests.get(f"{BASE_URL}/api/productos", timeout=10)

    api_context["response"] = response


@then("la respuesta debe tener código HTTP 200")
def validar_status_code(api_context):
    assert api_context["response"].status_code == 200


@then("la respuesta debe contener una lista de productos")
def validar_lista_productos(api_context):
    productos = api_context["response"].json()

    assert isinstance(productos, dict)
    assert "products" in productos
    assert isinstance(productos["products"], list)
    assert len(productos["products"]) > 0
    assert productos["total"] == len(productos["products"])
    
@when("envío un pedido para un producto inexistente")
def enviar_pedido_producto_inexistente(api_context):
    response = requests.post(
        f"{BASE_URL}/api/pedidos",
        json={
            "productId": 999999,
            "quantity": 1
        },
        timeout=10
    )

    api_context["response"] = response


@then("la respuesta debe tener código HTTP 404")
def validar_producto_no_encontrado(api_context):
    assert api_context["response"].status_code == 404


@then("la respuesta debe indicar que el producto no existe")
def validar_mensaje_producto_no_encontrado(api_context):
    body = api_context["response"].json()

    assert body["error"] == "Product not found"
    
@when("envío un pedido con cantidad inválida")
def enviar_pedido_cantidad_invalida(api_context):
    response = requests.post(
        f"{BASE_URL}/api/pedidos",
        json={
            "productId": 1,
            "quantity": 0
        },
        timeout=10
    )

    api_context["response"] = response


@then("la respuesta debe tener código HTTP 400")
def validar_cantidad_invalida(api_context):
    assert api_context["response"].status_code == 400


@then("la respuesta debe indicar que la cantidad es inválida")
def validar_mensaje_cantidad_invalida(api_context):
    body = api_context["response"].json()

    assert body["error"] == "Invalid quantity or insufficient stock"