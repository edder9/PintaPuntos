

async function pintaPuntos(urlData, divMapa, nombreCampo) {
  var script = document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js";
  document.getElementsByTagName("head")[0].appendChild(script);

  return new Promise((resolve, reject) => {
    var graphics = [];
    var generaFieldInfo=[];
    var graphic;
    let fields = [];
    setTimeout(() => {
      console.log(urlData);
     
      $.ajax({
        url: urlData,
        dataType: "json",
        cache: false,
        async: true,
        method: "GET",
      }).then(function (data) {
          console.log(data);
        const features = data.flat();
        for (var i = 0; i < features.length; i++) {
          graphic = {
            geometry: {
              type: "point",
              latitude: features[i].lat,
              longitude: features[i].lon,
            },
            attributes: features[i],
          };
          graphics.push(graphic);
        
        }
         /*FIELDS*/
      //AÑADIMOS LOS FIELDS  A FEATURE LAYER
      
      const arrayAtr = graphics[0].attributes;
      let type = "";

      if (Object.keys(arrayAtr)) {
        for (const property in arrayAtr) {
          if (
            typeof(`${property}`) == "string"
          ) {
            type = "string";
          } else {
            type = "double";
          }

          if (`${property}` == "OBJECTID") {
            type = "oid";
          }

          fields.push({
            name: `${property}`,
            alias: `${property}`,
            type: type,
          });

          generaFieldInfo.push(
            Object.assign({
              fieldName: `${property}`,
              label: `${property}`
            })
          );
        }
      }

      console.log(fields);

      graphics.length != 0 ? mapa(graphics, fields, generaFieldInfo, divMapa, nombreCampo) : console.log("Aun no");
      });
    }, 3000);

   
   // const pintaMapa = mapa(graphics, fields, generaFieldInfo);
    resolve("url");
  });
}

async function mapa(graphics, fields, generaFieldInfo, divMapa, nombreCampo) {
  return new Promise((resolve, reject) => {
   // console.log(puntos);

    var script = document.createElement("script");
    script.src = "https://js.arcgis.com/4.23/";
    document.getElementsByTagName("head")[0].appendChild(script);

    var head = document.getElementsByTagName("HEAD")[0];
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "https://js.arcgis.com/4.23/esri/themes/light/main.css";
    head.appendChild(link);

   

    setTimeout(() => {
      require([
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/Graphic"
      ], (Map, MapView, FeatureLayer, Graphic) => {
        const map = new Map({
          basemap: "topo-vector",
        });

        const view = new MapView({
          container: divMapa,
          map: map,
          zoom: 5,
          center: [-102.0, 23.0], // longitude, latitude
        });


        $("#"+divMapa+"").css("padding", 0)
        $("#"+divMapa+"").css("margin", 0)
        $("#"+divMapa+"").css("height", "100%")
        $("#"+divMapa+"").css("width", "100%")

        const layerRandom = new FeatureLayer({
          // create an instance of esri/layers/support/Field for each field object
          title: "Random Feature",
          objectIdField: "ObjectID",
          geometryType: "point",
          spatialReference: { wkid: 4326 },
          source: [], // adding an empty feature collection
          renderer: {
            type: "simple",
            symbol: {
              type: "picture-marker", // autocasts as new PictureMarkerSymbol()
              url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Google_Maps_pin.svg/585px-Google_Maps_pin.svg.png",
              width: "20px",
              height: "30px",
            },
          },
          popupTemplate: {
            title: "{"+nombreCampo+"}",
            outFields: ["*"],
            content: "datos",
          },
        });
        map.add(layerRandom);
        const nwArrayGrpics = [];
        for (let index = 0; index < graphics.length; index++) {
          const element = graphics[index];
          //console.log(element);
          var Nwgraphicss = new Graphic({
              geometry: element.geometry,
              attributes: element.attributes,
          });
          
          nwArrayGrpics.push(Nwgraphicss)
      }
      const addEdits = {
        addFeatures: nwArrayGrpics,
      };


        applyEditsToLayer(addEdits);
      


      function applyEditsToLayer(edits) {
        layerRandom
          .applyEdits(edits)
          .then((results) => {
           
            if (results.addFeatureResults.length > 0) {
              var objectIds = [];
              results.addFeatureResults.forEach((item) => {
                objectIds.push(item.objectId);
              });
              // query the newly added features from the layer
              layerRandom
                .queryFeatures({
                  objectIds: objectIds
                })
                .then((results) => {
                  console.log(
                    results.features.length,
                    "features have been added."
                    
                  );
                  
                });
            }
            console.log(layerRandom);
          })
          .catch((error) => {
            console.error();
          });
      }

      layerRandom.set({
        fields: fields,
        objectIdField: "OBJECTID",
      });
  
      layerRandom.popupTemplate.content = [
        {
          // It is also possible to set the fieldInfos outside of the content
          // directly in the popupTemplate. If no fieldInfos is specifically set
          // in the content, it defaults to whatever may be set within the popupTemplate.
          type: "fields",
          fieldInfos: generaFieldInfo,
        },
      ];

      view.goTo(nwArrayGrpics).then(function () {
        view.zoom = view.zoom  - 1;
    });


    //view.goTo( graphicsLayer.graphics );


        console.log(graphics, fields, generaFieldInfo);

      });
    }, 3000);
    resolve("Mapa");
  });
}

//export { geometria };

