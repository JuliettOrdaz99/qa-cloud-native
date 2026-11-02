Feature: Consulta de productos en la tienda

  Scenario: Consultar el catálogo de productos
    Given la API de la tienda está disponible
    When consulto el catálogo de productos
    Then la respuesta debe tener código HTTP 200
    And la respuesta debe contener una lista de productos

  Scenario: Rechazar un pedido de un producto inexistente
    Given la API de la tienda está disponible
    When envío un pedido para un producto inexistente
    Then la respuesta debe tener código HTTP 404
    And la respuesta debe indicar que el producto no existe

  Scenario: Rechazar un pedido con cantidad inválida
    Given la API de la tienda está disponible
    When envío un pedido con cantidad inválida
    Then la respuesta debe tener código HTTP 400
    And la respuesta debe indicar que la cantidad es inválida