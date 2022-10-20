'use strict'
const convert = require('xml-js')

exports.createConversion = async (montoDolares) => {
    try {

        const soapRequest = require('easy-soap-request');
        // Example data
        const url = 'https://banguat.gob.gt/variables/ws/TipoCambio.asmx?wsdl';
        const sampleHeaders = {
            'Content-Type': 'text/xml;charset=UTF-8'
        };
        const xml = `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <TipoCambioDia xmlns="http://www.banguat.gob.gt/variables/ws/" />
          </soap:Body>
        </soap:Envelope>`;

        function loadXMLDoc() {
          var xmlhttp = new XMLHttpRequest();
          xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
              myFunction(this);
            }
          };
          xmlhttp.open("GET", "cd_catalog.xml", true);
          xmlhttp.send();
        }
        // usage of module
        (async () => {

            const { response } = await soapRequest({ url: url, headers: sampleHeaders, xml: xml });
            const { headers, body, statusCode } = response;
            const result = convert.xml2json(body,{compact: true, spaces:4});
            const jsoncambio = JSON.parse(result);
            const cambio = jsoncambio["soap:Envelope"]["soap:Body"].TipoCambioDiaResponse.TipoCambioDiaResult.CambioDolar.VarDolar.referencia._text;
            const conversion = cambio * montoDolares; 
            console.log(conversion)
            //console.log(cambio);
        })();
    } catch (err) {
        console.log(err);
        return err
    }
}
