global.fetch = require("jest-fetch-mock");
fetch.enableMocks();

describe("Frontend - Gestión de Palabras (Nuevo front mejorado)", () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    fetch.resetMocks();

    document.body.innerHTML = `
      <input id="palabraInput" value="" />
      <div id="listaPalabras"></div>
      <div id="mensaje"></div>
    `;

    app = require("../app.js");
  });

  // ============================================================
  // mostrarMensaje()
  // ============================================================
  describe("mostrarMensaje()", () => {
    test("muestra mensaje de éxito", () => {
      app.mostrarMensaje("OK", "exito");
      const html = document.getElementById("mensaje").innerHTML;
      expect(html).toContain("exito");
      expect(html).toContain("OK");
    });

    test("muestra mensaje de error", () => {
      app.mostrarMensaje("Error grave", "error");
      const html = document.getElementById("mensaje").innerHTML;
      expect(html).toContain("error");
      expect(html).toContain("Error grave");
    });

    test("borra el mensaje después de 3 segundos", () => {
      jest.useFakeTimers();
      app.mostrarMensaje("Hola", "exito");
      jest.runAllTimers();
      expect(document.getElementById("mensaje").innerHTML).toBe("");
    });
  });

  // ============================================================
  // obtenerPalabras() (lógica de API pura)
  // ============================================================
  describe("obtenerPalabras()", () => {
    test("devuelve lista correctamente", async () => {
      const mockData = [{ id: 1, palabra: "casa" }];
      fetch.mockResponseOnce(JSON.stringify(mockData));

      const result = await app.obtenerPalabras();

      // ✅ Solo validamos el primer parámetro (URL)
      expect(fetch.mock.calls[0][0]).toBe("http://localhost/api/palabras");
      expect(result.ok).toBe(true);
      expect(result.data[0].palabra).toBe("casa");
    });

    test("maneja error de fetch", async () => {
      fetch.mockRejectOnce(new Error("Fallo de red"));

      const result = await app.obtenerPalabras();

      expect(result.ok).toBe(false);
      expect(result.status).toBe(500);
      expect(result.data.error).toBe("Fallo de red");
    });
  });

  // ============================================================
  // cargarPalabras() (DOM)
  // ============================================================
  describe("cargarPalabras()", () => {
    test("muestra lista de palabras", async () => {
      const mockData = [
        { id: 1, palabra: "sol" },
        { id: 2, palabra: "luna" }
      ];
      fetch.mockResponseOnce(JSON.stringify(mockData));

      await app.cargarPalabras();

      const html = document.getElementById("listaPalabras").innerHTML;
      expect(html).toContain("sol");
      expect(html).toContain("luna");
    });

    test("muestra mensaje cuando no hay palabras", async () => {
      fetch.mockResponseOnce(JSON.stringify([]));

      await app.cargarPalabras();

      expect(document.getElementById("listaPalabras").innerHTML)
        .toContain("No hay palabras guardadas");
    });

    test("muestra error cuando la API falla", async () => {
      fetch.mockRejectOnce(new Error("API caída"));

      await app.cargarPalabras();

      const html = document.getElementById("mensaje").innerHTML;
      expect(html).toContain("Error al cargar palabras");
      expect(html).toContain("error"); // clase CSS
    });
  });

  // ============================================================
  // agregarPalabra()
  // ============================================================
  describe("agregarPalabra()", () => {
    test("valida entrada vacía", async () => {
      document.getElementById("palabraInput").value = "   ";

      await app.agregarPalabra();

      expect(fetch).not.toHaveBeenCalled();
      expect(document.getElementById("mensaje").innerHTML)
        .toContain("Por favor ingresa una palabra");
    });

    test("agrega palabra correctamente", async () => {
      document.getElementById("palabraInput").value = "cielo";

      fetch.mockResponses(
        [JSON.stringify({ id: 1, palabra: "cielo" }), { status: 200 }],
        [JSON.stringify([{ id: 1, palabra: "cielo" }]), { status: 200 }]
      );

      await app.agregarPalabra();

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost/api/palabras",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ palabra: "cielo" })
        })
      );
      expect(document.getElementById("palabraInput").value).toBe("");
    });

    test("maneja error al agregar", async () => {
      document.getElementById("palabraInput").value = "errorcito";

      // Tu app usa: resultado.data.error || "Error al agregar palabra"
      fetch.mockResponseOnce(
        JSON.stringify({ error: "No se pudo" }),
        { status: 500 }
      );

      await app.agregarPalabra();

      const html = document.getElementById("mensaje").innerHTML;
      // ✅ Coincidimos con el comportamiento real
      expect(html).toContain("No se pudo");
      expect(html).toContain("error"); // clase CSS
    });
  });

  // ============================================================
  // eliminarPalabra()
  // ============================================================
  describe("eliminarPalabra()", () => {
    test("no elimina si el usuario cancela", async () => {
      window.confirm = jest.fn(() => false);

      await app.eliminarPalabra(1);

      expect(fetch).not.toHaveBeenCalled();
    });

    test("elimina correctamente cuando confirma", async () => {
      window.confirm = jest.fn(() => true);

      fetch.mockResponses(
        [JSON.stringify({ mensaje: "OK" }), { status: 200 }],
        [JSON.stringify([]), { status: 200 }]
      );

      await app.eliminarPalabra(5);

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost/api/palabras/5",
        expect.objectContaining({ method: "DELETE" })
      );
    });

    test("maneja error al eliminar", async () => {
      window.confirm = jest.fn(() => true);

      fetch.mockResponseOnce(
        JSON.stringify({ error: "No se pudo eliminar" }),
        { status: 500 }
      );

      await app.eliminarPalabra(3);

      const html = document.getElementById("mensaje").innerHTML;
      // ✅ Coincide con tu app.js
      expect(html).toContain("No se pudo eliminar");
      expect(html).toContain("error"); // clase CSS
    });
  });
});
