import handlebars from "handlebars";
import { minify } from "html-minifier-terser";

const { compile } = handlebars;

const htmlTemplate = `
<!DOCTYPE html>
<html>
    <head>
        <style>
            body, html {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
                background-color: #ffffff;
            }
            #main {
                width: 560px;
                height: 560px;
            }
        </style>
    </head>
    <body>
        <canvas id="main" width="569" height="569"></canvas>
        <script src="/content/{{ cborInscriptionId }}>"></script>
        <script src="/content/{{ scriptUrl }}" type="text/javascript"></script>
    </body>
</html>
`;

export async function generateHTML(
  scriptUrl: string,
  tokenId: number,
  genesis: boolean,
  revealedAt: number,
) {
  const template = compile(htmlTemplate);

  const renderedHtml = template({
    scriptUrl,
    tokenId,
    genesis,
    revealedAt,
  });

  return await minify(renderedHtml, {
    minifyCSS: true,
    minifyJS: true,
    collapseWhitespace: true,
    removeComments: true,
  });
}
