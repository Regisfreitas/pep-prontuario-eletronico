export default function BackendOfflineBanner({ onRetry }) {
  return (
    <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
      <p className="font-semibold mb-1">Back-end offline (porta 3001)</p>
      <p className="mb-2 text-red-700">
        O Google Agenda e a API precisam do servidor Node.js rodando. Abra um terminal na pasta do
        projeto e execute:
      </p>
      <code className="block bg-red-100 px-3 py-2 rounded text-xs font-mono mb-2">
        cd C:\Users\Windows\Projects\pep-emr
        <br />
        npm run dev
      </code>
      <p className="text-red-600 text-xs mb-2">
        Aguarde aparecer no terminal: <strong>PEP EMR server running on http://localhost:3001</strong>
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        Tentar novamente
      </button>
    </div>
  );
}
