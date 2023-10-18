import type { JSONContent } from '@tiptap/react';

export const initialContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'La ',
        },
        {
          type: 'text',
          marks: [{ type: 'italic' }],
          text: 'situation',
        },
        {
          type: 'text',
          text: ' de ',
        },
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: 'Monsieur',
        },
        {
          type: 'text',
          text: ' ',
        },
        {
          type: 'mention',
          attrs: { id: 'lastName', label: 'Nom' },
        },
        {
          type: 'text',
          text: ' dont la demande de logement social porte le NUR ',
        },
        {
          type: 'mention',
          attrs: { id: 'nur', label: 'NUR' },
        },
        {
          type: 'text',
          text: " est reconnue prioritaire au titre du plan départemental d'actions pour le logement et l'hébergement des personnes défavorisées.",
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [{ type: 'italic' }],
          text: 'Informations :',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [{ type: 'italic' }],
          text: 'Cette reconnaissance de priorité rend le dossier du requérant éligible au contingent préfectoral de logements sociaux réservé aux publics prioriatires.',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [{ type: 'italic' }],
          text: "Dans ce cadre, une proposition de logement sera faites par les services de la DRIHL dès lors qu'ils disposeront d'un logement vacant correspondant aux besoins et aux capacités de la famille.",
        },
      ],
    },
  ],
};

export function getContent(): JSONContent {
  const content = localStorage.getItem('tiptap-content');

  if (content) {
    return JSON.parse(content);
  }

  return initialContent;
}

export function setContent(content: JSONContent) {
  localStorage.setItem('tiptap-content', JSON.stringify(content));
}

export function resetContent() {
  setContent(initialContent);
}

export function withLayout(doc: JSONContent) {
  return [
    {
      type: 'grid',
      content: [
        {
          type: 'column',
          content: [
            {
              type: 'image',
              attrs: {
                src: 'https://upload.wikimedia.org/wikipedia/fr/5/50/Bloc_Marianne.svg',
                width: 100,
              },
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'PRÉFET\nDU VAL-\nDE-MARNE',
                },
              ],
            },
          ],
        },
        {
          type: 'column',
          content: [
            {
              type: 'paragraph',
              attrs: { textAlign: 'right' },
              content: [
                {
                  type: 'text',
                  text: 'Direction Régionale et Interdépartementale\nde l’Hébergement et du Logement\nDRIHL Val-de-Marne',
                  marks: [{ type: 'bold' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'grid',
      content: [
        {
          type: 'column',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Service Hébergement et Accès au Logement\nBureau de l’Accès au Logement',
                },
              ],
            },
          ],
        },
        {
          type: 'column',
          content: [
            {
              type: 'paragraph',
              attrs: { textAlign: 'right' },
              content: [
                {
                  type: 'text',
                  text: 'Créteil, le 20 mars 2023',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 1, textAlign: 'center' },
      content: [
        {
          type: 'text',
          text: 'ATTESTATION',
        },
      ],
    },
    ...(doc.content ?? []),
  ];
}
