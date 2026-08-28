const axios = require('axios');
const cheerio = require('cheerio');

async function cazarMercadoLibre(busqueda) {
    const url = 'https://listado.mercadolibre.com.co/' + encodeURIComponent(busqueda);
    console.log('? [HUNTER] Iniciando caza en MercadoLibre Colombia para: ' + busqueda);
    console.log('� URL Objetivo: ' + url);

    try {
        const t0 = Date.now();
        // Petición HTTP camuflada usando User-Agent Móvil
        const respuesta = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-M105M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                'Accept-Language': 'es-CO,es;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
            },
            timeout: 10000 
        });
        
        const html = respuesta.data;
        const $ = cheerio.load(html);
        const resultados = [];

        // Extraer todos los items de la página de resultados
        $('.ui-search-layout__item').each((i, elemento) => {
            const titulo = $(elemento).find('h2').text().trim();
            const precioTexto = $(elemento).find('.andes-money-amount__fraction').first().text().replace(/\./g, '').trim();
            const precio = parseInt(precioTexto) || 0;
            const enlace = $(elemento).find('.ui-search-link').attr('href');
            const descuentoTexto = $(elemento).find('.andes-money-amount__discount').text().trim(); // Ej: "20% OFF"

            if (titulo && precio > 0) {
                resultados.push({titulo, precio, descuento: descuentoText, enlace});
            }
        });

        const t1 = Date.now();
        console.log('? Cacería exitosa. Extraídos ' + resultados.length + ' productos en ' + (t1 - t0) + ' ms.');

        // Analítica Violenta: Ordenar del MÁS BARATO al MÁS CARO
        resultados.sort((a, b) => a.precio - b.precio);

        console.log('\n? TOP 3 LOS MÁS BARATOS DEL HOYO DEL DEMONIO:');
        for(let i = 0; i < Math.min(3, resultados.length); i++) {
            console.log('\n[' + (i+1) + '] ' + resultados[i].titulo);
            console.log('? Precio: $' + resultados[i].precio.toLocaleString('es-CO') + ' ' + resultados[i].descuento);
            console.log('? Link: ' + resultados[i].enlace);
        }

    } catch (error) {
        console.error('? El Escudo de ML nos bloqueó o hubo un error:', error.message);
    }
}

// Ejecutar la prueba buscando 'iphone 13'
cazarMercadoLibre('iphone 13');