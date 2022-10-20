' use strict '

//Importación del Modelo -Product-
const Product = require('../models/product.model');
const PaymentBox = require('../models/paymentBox.model');


//Importación del Modelo -Cliente-
const Client = require('../models/client.model');
const pdf = require("html-pdf");
const fs = require("fs");

const ubicacionPlantilla = require.resolve('../html/factura.html');
const plantillaRetiro = require.resolve('../html/Formato_Retiro_Caja.html');
const plantillaPagosVarios = require.resolve('../html/Formato_Pagos_Varios.html');
const plantillaAligeramientoDeVentas = require.resolve('../html/Formato_Aligeramiento_De_Ventas.html');
const plantillaCierreDelDia = require.resolve('../html/Formato_CierreDelDía.html')
const plantillaAperturaCaja = require.resolve('../html/Formato_Apertura_Caja.html');
let contenidoHtml = fs.readFileSync(ubicacionPlantilla, 'utf8');
let contenidoRetiro = fs.readFileSync(plantillaRetiro, 'utf8');
let contenidoPagosVarios = fs.readFileSync(plantillaPagosVarios, 'utf8');
let contenidoAligeramientoVentas = fs.readFileSync(plantillaAligeramientoDeVentas, 'utf8');
let contenidoAperturaCaja = fs.readFileSync(plantillaAperturaCaja, 'utf-8');
let contenidoCierreDelDia = fs.readFileSync(plantillaCierreDelDia, "utf-8");

// Estos productos podrían venir de cualquier lugar

exports.savePDF = async(bill)=>{
    try{
        var number = bill.numberBill;
        var tabla = "";
        for (var key = 0; key < bill.products.length; key++) {

            //ID de cada Producto del Carrito.//
            var setProduct = bill.products[key].product;
            //Quantity - CARRITO//
            var productQuantity = bill.products[key].quantity;
            //Subtotal Producto - CARRITO//
            var subTotalProduct = setProduct.price * productQuantity;
            //Obtener Stock y Sales de los Productos del Carrito.//
            var product = await Product.findOne({_id:setProduct});
            // Y concatenar los productos
            tabla += `<tr>
            <td>${product.name}</td>
            <td>${productQuantity}</td>
            <td>Q.${product.price}</td>
            <td>Q.${subTotalProduct}</td>
            </tr>`;
        }
        // Remplazar el valor {{tablaProductos}} por el verdadero valor
        contenidoHtml = contenidoHtml.replace("{{tableProducts}}", tabla);

        // Y también los otros valores
        const findClient = await Client.findOne({_id: bill.NIT}).lean();
        contenidoHtml = contenidoHtml.replace("{{numberBill}}", `${number}`);
        contenidoHtml = contenidoHtml.replace("{{IVA}}", `Q.${bill.IVA.toFixed(2)}`);
        contenidoHtml = contenidoHtml.replace("{{client}}", `${findClient.name} ${findClient.surname}`);
        contenidoHtml = contenidoHtml.replace("{{IVA}}", `Q.${bill.IVA.toFixed(2)}`);
        contenidoHtml = contenidoHtml.replace("{{subtotal}}", `Q.${bill.subTotal.toFixed(2)}`);
        contenidoHtml = contenidoHtml.replace("{{total}}", `Q.${bill.total.toFixed(2)}`);
        contenidoHtml = contenidoHtml.replace("{{date}}",`${bill.date}`);
        contenidoHtml = contenidoHtml.replace("{{NIT}}",`${bill.NIT}`);
        pdf.create(contenidoHtml).toFile(`./pdfs/Factura${bill.numberBill}.pdf`, (error) => {
            if (error) {
                console.log("Error creando PDF: " + error)
            } else {
                console.log("PDF creado correctamente");
            }
        });

    }catch(err){
        console.log(err);
        return err;
    }
}




//Función de seteo de Datos Al comrobante de Retiro de Caja//
exports.saveRetiroPDF = async(viewRetiro)=>{
    try{
        var number = 0;
        const numberRetiro = number +1;
        
        // Y también los otros valores
        plantillaRetiro = contenidoRetiro.replace("{{DateNow}}", `${viewRetiro.DateNow}`);
        plantillaRetiro = contenidoRetiro.replace("{{Branch}}", `${viewRetiro.branch}`);
        plantillaRetiro = contenidoRetiro.replace("{{User}}", `${viewRetiro.user}`);
        plantillaRetiro = contenidoRetiro.replace("{{Encaja}}", `Q.${viewRetiro.Encaja.toFixed(2)}`);
        plantillaRetiro = contenidoRetiro.replace("{{retiro}}", `Q.${viewRetiro.retiro.toFixed(2)}`);
        plantillaRetiro = contenidoRetiro.replace("{{total}}", `Q.${viewRetiro.Total.toFixed(2)}`);
        plantillaRetiro = contenidoRetiro.replace("{{Authorized}}", `Q.${viewRetiro.Autorization}`);
        pdf.create(contenidoRetiro).toFile(`./pdfs/Retiros${+numberRetiro}.pdf`, (error) => {
            if (error) {
                console.log("Error creando PDF: " + error)
            } else {
                console.log("PDF creado correctamente");
            }
        });

    }catch(err){
        console.log(err);
        return err;
    }
}




//Función seteo de datos para el comprobante de Pagos Varios//
exports.savePagosVariosPDF = async(viewPagosVarios)=>{
    try{
        var number = 0;
        const numeroPagosVarios = number +1;
        
        // Remplazó de datos del Comprobante//00
        plantillaAperturaCaja = contenidoPagosVarios.replace("{{DateNow}}", `${viewPagosVarios.DateNow}`);
        plantillaAperturaCaja = contenidoPagosVarios.replace("{{Branch}}", `${viewPagosVarios.branch}`);
        plantillaAperturaCaja = contenidoPagosVarios.replace("{{User}}", `${viewPagosVarios.user}`);
        plantillaAperturaCaja = contenidoPagosVarios.replace("{{Encaja}}", `Q.${viewPagosVarios.Encaja.toFixed(2)}`);
        plantillaAperturaCaja = contenidoPagosVarios.replace("{{pagosVarios}}", `Q.${viewPagosVarios.retiro.toFixed(2)}`);
        plantillaAperturaCaja = contenidoPagosVarios.replace("{{total}}", `Q.${viewPagosVarios.Total.toFixed(2)}`);
        plantillaAperturaCaja = contenidoPagosVarios.replace("{{Authorized}}", `Q.${viewPagosVarios.Autorization}`);
        pdf.create(contenidoRetiro).toFile(`./pdfs/Retiros${+numeroPagosVarios}.pdf`, (error) => {
            if (error) {
                console.log("Error creando PDF: " + error)
            } else {
                console.log("PDF creado correctamente");
            }
        });

    }catch(err){
        console.log(err);
        return err;
    }
}



//Función seteo de datos de Comprobante de Pagos Varios//
exports.saveAligeramientoVentasPDF = async(viewAligeramientoVentas)=>{
    try{
        var number = 0;
        const numeroAligeramientoVentas = number +1;
        
        // Remplazó de datos del Comprobante//00
        plantillaAligeramientoDeVentas = contenidoAligeramientoVentas.replace("{{DateNow}}", `${viewAligeramientoVentas.DateNow}`);
        plantillaAligeramientoDeVentas = contenidoAligeramientoVentas.replace("{{Branch}}", `${viewAligeramientoVentas.branch}`);
        plantillaAligeramientoDeVentas = contenidoAligeramientoVentas.replace("{{User}}", `${viewAligeramientoVentas.user}`);
        plantillaAligeramientoDeVentas = contenidoAligeramientoVentas.replace("{{Encaja}}", `Q.${viewAligeramientoVentas.Encaja.toFixed(2)}`);
        plantillaAligeramientoDeVentas = contenidoAligeramientoVentas.replace("{{aligeramientosVentas}}", `Q.${viewAligeramientoVentas.aligeramientoVentas.toFixed(2)}`);
        plantillaAligeramientoDeVentas = contenidoAligeramientoVentas.replace("{{total}}", `Q.${viewAligeramientoVentas.Total.toFixed(2)}`);
        plantillaAligeramientoDeVentas = contenidoAligeramientoVentas.replace("{{Authorized}}", `Q.${viewAligeramientoVentas.Autorization}`);
        pdf.create(contenidoRetiro).toFile(`./pdfs/AligeramientoVentas${+numeroAligeramientoVentas}.pdf`, (error) => {
            if (error) {
                console.log("Error creando PDF: " + error)
            } else {
                console.log("PDF creado correctamente");
            }
        });

    }catch(err){
        console.log(err);
        return err;
    }
}




//Función seteo de datos de Comprobante de Cierre de Caja//
exports.saveCierreDelDiaPDF = async(viewCierreDelDia)=>{
    try{
        var number = 0;
        const numeroCierreDelDia = number +1;
        
        // Remplazó de datos del Comprobante//00
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{DateNow}}", `${viewCierreDelDia.FechaCierre}`);
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{Branch}}", `${viewCierreDelDia.branch}`);
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{User}}", `${viewCierreDelDia.user}`);
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{Authorized}}", `${viewCierreDelDia.Autorization}`);
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{CierreNO}}", `#${numeroCierreDelDia}`);

        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{Fondo}}", `Q.${viewCierreDelDia.Fondo.toFixed(2)}`);
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{TotalEfectivo}}", `Q.${viewCierreDelDia.Efectivo.toFixed(2)}`);
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{TotalTarjetas}}", `Q.${viewCierreDelDia.Tarjeta.toFixed(2)}`);
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{TotalCheques}}", `Q.${viewCierreDelDia.Cheques.toFixed(2)}`);
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{Aligeramientos}}", `Q.${viewCierreDelDia.Aligeramientos.toFixed(2)}`);
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{PagosVarios}}", `Q.${viewCierreDelDia.PagosVarios.toFixed(2)}`);
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{RetiroVuelto}}", `Q.${viewCierreDelDia.RetirosVueltos.toFixed(2)}`);
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{TotalCaja}}", `Q.${viewCierreDelDia.EnCaja.toFixed(2)}`);
        
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{TarjetasVisa}}", `Q.${viewCierreDelDia.TotalVisa.toFixed(2)}`);
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{TarjetasCredomatic}}", `Q.${viewCierreDelDia.TotalCredomatic.toFixed(2)}`);

        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{TotalDolares}}", `Q.${viewCierreDelDia.Dolares.toFixed(2)}`);
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{VueltoQuetzales}}", `Q.${viewCierreDelDia.VueltosQuetzales.toFixed(2)}`);

        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{TotalVentas}}", `Q.${viewCierreDelDia.TotalVentas.toFixed(2)}`);
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{TotalImpuestos}}", `Q.${viewCierreDelDia.TotalIMpuestos.toFixed(2)}`);
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{TotalDescuentos}}", `Q.${viewCierreDelDia.TotalDescuentos.toFixed(2)}`);
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{TotalPropinas}}", `Q.${viewCierreDelDia.TotalPropinas.toFixed(2)}`);
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{TotalCredito}}", `Q.${viewCierreDelDia.TotalCreditos.toFixed(2)}`);
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{RetiroFondo}}", `Q.${viewCierreDelDia.Retiros.toFixed(2)}`);
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{CantidadFacturas}}", `#.${viewCierreDelDia.CantidadFacturas}`);
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{CantidadRecibos}}", `#.${viewCierreDelDia.CantidadRecibos}}}`);
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{Inicial}}", `Q.${viewCierreDelDia.InicioCaja}`);
        plantillaCierreDelDia = contenidoCierreDelDia.replace("{{Final}}", `Q.${viewCierreDelDia.FinalCierre}`);
        pdf.create(contenidoCierreDelDia).toFile(`./pdfs/CierreDelDia${+numeroCierreDelDia}.pdf`, (error) => {
            if (error) {
                console.log("Error creando PDF: " + error)
            } else {
                console.log("PDF creado correctamente");
            }
        });

    }catch(err){
        console.log(err);
        return err;
    }
}





//Función seteo de datos de Comprobante de Cierre de Caja//
exports.saveAperturaCajaPDF = async(viewAperturaCaja)=>{
    try{
        var number = 0;
        const numeroAperturaCaja = number +1;
        
        // Remplazó de datos del Comprobante//00
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{DateNow}}", `${viewAperturaCaja.FechaApertura}`);
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{Branch}}", `${viewAperturaCaja.branch}`);
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{User}}", `${viewAperturaCaja.user}`);
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{Authorized}}", `${viewAperturaCaja.Autorization}`);
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{ArqueoNO}}", `#${numeroAperturaCaja}`);

        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{Fondo}}", `Q.${viewAperturaCaja.Fondo.toFixed(2)}`);
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{TotalEfectivo}}", `Q.${viewAperturaCaja.Efectivo.toFixed(2)}`);
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{TotalTarjetas}}", `Q.${viewAperturaCaja.Tarjeta.toFixed(2)}`);
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{TotalCheques}}", `Q.${viewAperturaCaja.Cheques.toFixed(2)}`);
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{Aligeramientos}}", `Q.${viewAperturaCaja.Aligeramientos.toFixed(2)}`);
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{PagosVarios}}", `Q.${viewAperturaCaja.PagosVarios.toFixed(2)}`);
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{RetiroVuelto}}", `Q.${viewAperturaCaja.RetirosVueltos.toFixed(2)}`);
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{TotalCaja}}", `Q.${viewAperturaCaja.EnCaja.toFixed(2)}`);
        
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{TarjetasVisa}}", `Q.${viewAperturaCaja.TotalVisa.toFixed(2)}`);
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{TarjetasCredomatic}}", `Q.${viewAperturaCaja.TotalCredomatic.toFixed(2)}`);

        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{TotalDolares}}", `Q.${viewAperturaCaja.Dolares.toFixed(2)}`);
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{VueltoQuetzales}}", `Q.${viewAperturaCaja.VueltosQuetzales.toFixed(2)}`);

        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{TotalVentas}}", `Q.${viewAperturaCaja.TotalVentas.toFixed(2)}`);
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{TotalImpuestos}}", `Q.${viewAperturaCaja.TotalIMpuestos.toFixed(2)}`);
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{TotalDescuentos}}", `Q.${viewAperturaCaja.TotalDescuentos.toFixed(2)}`);
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{TotalPropinas}}", `Q.${viewAperturaCaja.TotalPropinas.toFixed(2)}`);
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{TotalCredito}}", `Q.${viewAperturaCaja.TotalCreditos.toFixed(2)}`);
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{RetiroFondo}}", `Q.${viewAperturaCaja.Retiros.toFixed(2)}`);
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{CantidadFacturas}}", `#.${viewAperturaCaja.CantidadFacturas}`);
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{CantidadRecibos}}", `#.${viewAperturaCaja.CantidadRecibos}}}`);
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{Inicial}}", `Q.${viewAperturaCaja.InicioCaja}`);
        plantillaAperturaCaja = contenidoAperturaCaja.replace("{{Final}}", `Q.${viewAperturaCaja.FinalCierre}`);
        pdf.create(contenidoAperturaCaja).toFile(`./pdfs/AperturaDeCaja${+numeroAperturaCaja}.pdf`, (error) => {
            if (error) {
                console.log("Error creando PDF: " + error)
            } else {
                console.log("PDF creado correctamente");
            }
        });

    }catch(err){
        console.log(err);
        return err;
    }
}

