export default function handler(_request: unknown, response: { status: (code: number) => { json: (body: unknown) => void } }) {
  response.status(200).json({
    name: 'branas-formacao-ai-painel-clima-ts-cy',
    services: {
      painel_clima: '/painel_clima/health',
      painel_clima_cy: '/painel_clima_cy/health'
    }
  });
}
