# geojson2png

To install dependencies:

```bash
bun install
```

To run:

```bash
SECRET_TOKEN="SECRET" bun start
```

To use:

```bash
curl --request POST \
  --url http://localhost:8080/v1 \
  --header 'Authorization: Bearer SECRET_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
  "document": {
    "title": "Document",
    "children": [
      {
        "type": "section",
        "direction": "horizontal",
        "children": [
          {
            "type": "section",
            "children": [
              {
                "type": "image",
                "src": "https://upload.wikimedia.org/wikipedia/fr/5/50/Bloc_Marianne.svg",
                "width": 100
              },
              {
                "type": "paragraph",
                "children": [
                  {
                    "text": "PRÉFET\nDU VAL-\nDE-MARNE"
                  }
                ]
              }
            ]
          },
          {
            "type": "section",
            "align": "right",
            "children": [
              {
                "type": "paragraph",
                "children": [
                  {
                    "text": "Direction Régionale et Interdépartementale\nde l’Hébergement et du Logement\nDRIHL Val-de-Marne",
                    "bold": true
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "type": "section",
        "direction": "horizontal",
        "children": [
          {
            "type": "section",
            "children": [
              {
                "type": "paragraph",
                "children": [
                  {
                    "text": "Service Hébergement et Accès au Logement\nBureau de l’Accès au Logement"
                  }
                ]
              }
            ]
          },
          {
            "type": "section",
            "align": "right",
            "children": [
              {
                "type": "paragraph",
                "children": [
                  {
                    "text": "Créteil, le 20 mars 2023"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "type": "section",
        "align": "center",
        "children": [
          {
            "type": "heading",
            "level": 1,
            "children": [
              {
                "text": "ATTESTATION"
              }
            ]
          }
        ]
      },
      {
        "type": "section",
        "children": [
          {
            "type": "paragraph",
            "children": [
              {
                "text": "La "
              },
              {
                "text": "situation",
                "bold": true
              },
              {
                "text": " de Monsieur "
              },
              {
                "type": "tag",
                "tag": "lastName"
              },
              {
                "text": " dont la "
              },
              {
                "text": "demande",
                "italic": true
              },
              {
                "type": "text",
                "text": " de logement social porte le NUR "
              },
              {
                "type": "tag",
                "tag": "nur"
              },
              {
                "type": "text",
                "text": " est reconnue prioritaire au titre du plan départemental d’actions pour le logement et l’hébergement des personnes défavorisées."
              }
            ]
          },
          {
            "type": "bulleted-list",
            "children": [
              {
                "type": "list-item",
                "children": [
                  {
                    "text": "document 1"
                  }
                ]
              },
              {
                "type": "list-item",
                "children": [
                  {
                    "text": "document 2"
                  }
                ]
              },
              {
                "type": "list-item",
                "children": [
                  {
                    "text": "document 3"
                  }
                ]
              }
            ]
          },
          {
            "type": "paragraph",
            "children": [
              {
                "text": "Hic cumque reprehenderit ipsam neque quo placeat facilis assumenda ut quis ut esse expedita. Ut voluptatem assumenda et natus ducimus ut. Non sunt veniam molestias rerum hic ea accusamus recusandae tempore asperiores sed quia commodi tempora expedita. Dolor odit repellat quas esse quae aut pariatur officia sint laudantium sunt ut. Dolorem ratione a consequatur praesentium reiciendis ea quia dolorum deleniti. Veniam sequi quis at velit qui in aliquam ratione sunt nemo. Molestiae porro hic et mollitia nesciunt odio et aspernatur consequatur. Quis ad nulla dolorum omnis omnis delectus porro laborum ea est cum rerum. Maxime vel quia voluptatem et vitae vero nobis eos officia quisquam."
              }
            ]
          },
          {
            "type": "paragraph",
            "children": [
            ]
          },
          {
            "type": "paragraph",
            "children": [
              {
                "text": "Informations :",
                "italic": true
              }
            ]
          },
          {
            "type": "paragraph",
            "children": [
              {
                "text": "Cette reconnaissance de priorité rend le dossier du requérant éligible au contingent préfectoral de logements sociaux réservé aux publics prioriatires.\nDans ce cadre, une proposition de logement sera faites par les services de la DRIHL dès lors qu’ils disposeront d’un logement vacant correspondant aux besoins et aux capacités de la famille.",
                "italic": true
              }
            ]
          },
          {
            "type": "paragraph",
            "children": [
              {
                "text": "Dans l’attente, IL EST INUTILE DE CONTACTER LA DRIHL",
                "italic": true
              }
            ]
          },
          {
            "type": "paragraph",
            "children": [
              {
                "text": "Par ailleurs, en vertu des dispositions de la loi Egalité et Citoyenneté, les réservataires autres que l’État (villes. Action Logement, bailleurs sociaux sur leur contingent propre, etc) doivent également contribuer au relogement des publics prioritaires, à hauteur de 25% de leurs attributions.",
                "italic": true
              }
            ]
          }
        ]
      }
    ]
  },
  "tags": [
    {
      "tag": "lastName",
      "value": "Chavard"
    },
    {
      "tag": "nur",
      "value": "12345abcd"
    }
  ],
  "format": "pdf"
}'
```
