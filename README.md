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
  --url https://impress.tchak.dev/v1 \
  --header 'Content-Type: application/json' \
  --data '{
  "document": {
    "type": "doc",
    "attrs": {
      "title": "Attestation"
    },
    "content": [
      {
        "type": "grid",
        "content": [
          {
            "type": "section",
            "content": [
              {
                "type": "image",
                "attrs": {
                  "src": "https://upload.wikimedia.org/wikipedia/fr/5/50/Bloc_Marianne.svg",
                  "width": 100
                }
              },
              {
                "type": "paragraph",
                "content": [
                  {
                    "type": "text",
                    "text": "PRÉFET\nDU VAL-\nDE-MARNE"
                  }
                ]
              }
            ]
          },
          {
            "type": "section",
            "attrs": {
              "align": "right"
            },
            "content": [
              {
                "type": "paragraph",
                "content": [
                  {
                    "type": "text",
                    "text": "Direction Régionale et Interdépartementale\nde l’Hébergement et du Logement\nDRIHL Val-de-Marne",
                    "marks": [
                      {
                        "type": "bold"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "type": "grid",
        "content": [
          {
            "type": "section",
            "content": [
              {
                "type": "paragraph",
                "content": [
                  {
                    "type": "text",
                    "text": "Service Hébergement et Accès au Logement\nBureau de l’Accès au Logement"
                  }
                ]
              }
            ]
          },
          {
            "type": "section",
            "attrs": {
              "align": "right"
            },
            "content": [
              {
                "type": "paragraph",
                "content": [
                  {
                    "type": "text",
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
        "attrs": {
          "align": "center"
        },
        "content": [
          {
            "type": "heading",
            "attrs": {
              "level": 1
            },
            "content": [
              {
                "type": "text",
                "text": "ATTESTATION"
              }
            ]
          }
        ]
      },
      {
        "type": "section",
        "content": [
          {
            "type": "paragraph",
            "content": [
              {
                "type": "text",
                "text": "La "
              },
              {
                "type": "text",
                "text": "situation",
                "marks": [
                  {
                    "type": "bold"
                  }
                ]
              },
              {
                "type": "text",
                "text": " de Monsieur "
              },
              {
                "type": "tag",
                "attrs": {
                  "id": "lastName"
                }
              },
              {
                "type": "text",
                "text": " dont la "
              },
              {
                "type": "text",
                "text": "demande",
                "marks": [
                  {
                    "type": "italic"
                  }
                ]
              },
              {
                "type": "text",
                "text": " de logement social porte le NUR ",
                "marks": [
                  {
                    "type": "underline"
                  }
                ]
              },
              {
                "type": "tag",
                "attrs": {
                  "id": "nur"
                }
              },
              {
                "type": "text",
                "text": " est reconnue prioritaire au titre du plan départemental d’actions pour le logement et l’hébergement des personnes défavorisées."
              }
            ]
          },
          {
            "type": "bulletList",
            "content": [
              {
                "type": "listItem",
                "content": [
                  {
                    "type": "paragraph",
                    "content": [
                      {
                        "type": "text",
                        "text": "document 1",
                        "marks": [
                          {
                            "type": "highlight"
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                "type": "listItem",
                "content": [
                  {
                    "type": "paragraph",
                    "content": [
                      {
                        "type": "text",
                        "text": "document 2"
                      }
                    ]
                  }
                ]
              },
              {
                "type": "listItem",
                "content": [
                  {
                    "type": "paragraph",
                    "content": [
                      {
                        "type": "text",
                        "text": "document 3"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "type": "paragraph",
            "content": [
              {
                "type": "text",
                "text": "Hic cumque reprehenderit ipsam neque quo placeat facilis assumenda ut quis ut esse expedita. Ut voluptatem assumenda et natus ducimus ut. Non sunt veniam molestias rerum hic ea accusamus recusandae tempore asperiores sed quia commodi tempora expedita. Dolor odit repellat quas esse quae aut pariatur officia sint laudantium sunt ut. Dolorem ratione a consequatur praesentium reiciendis ea quia dolorum deleniti. Veniam sequi quis at velit qui in aliquam ratione sunt nemo. Molestiae porro hic et mollitia nesciunt odio et aspernatur consequatur. Quis ad nulla dolorum omnis omnis delectus porro laborum ea est cum rerum. Maxime vel quia voluptatem et vitae vero nobis eos officia quisquam."
              }
            ]
          },
          {
            "type": "paragraph",
            "content": [
            ]
          },
          {
            "type": "paragraph",
            "content": [
              {
                "type": "text",
                "text": "Informations :",
                "marks": [
                  {
                    "type": "italic"
                  }
                ]
              }
            ]
          },
          {
            "type": "paragraph",
            "content": [
              {
                "type": "text",
                "text": "Cette reconnaissance de priorité rend le dossier du requérant éligible au contingent préfectoral de logements sociaux réservé aux publics prioriatires.\nDans ce cadre, une proposition de logement sera faites par les services de la DRIHL dès lors qu’ils disposeront d’un logement vacant correspondant aux besoins et aux capacités de la famille.",
                "marks": [
                  {
                    "type": "italic"
                  }
                ]
              }
            ]
          },
          {
            "type": "paragraph",
            "content": [
              {
                "type": "text",
                "text": "Dans l’attente, IL EST INUTILE DE CONTACTER LA DRIHL",
                "marks": [
                  {
                    "type": "italic"
                  }
                ]
              }
            ]
          },
          {
            "type": "paragraph",
            "content": [
              {
                "type": "text",
                "text": "Par ailleurs, en vertu des dispositions de la loi Egalité et Citoyenneté, les réservataires autres que l’État (villes. Action Logement, bailleurs sociaux sur leur contingent propre, etc) doivent également contribuer au relogement des publics prioritaires, à hauteur de 25% de leurs attributions.",
                "marks": [
                  {
                    "type": "italic"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "tags": [
    {
      "id": "lastName",
      "value": "Chavard"
    },
    {
      "id": "nur",
      "value": "12345abcd"
    }
  ],
  "format": "pdf"
}'
```
