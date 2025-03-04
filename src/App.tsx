import React, { useState, useEffect, useReducer } from 'react';

interface Endereco {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

const cacheReducer = (state: { [key: string]: Endereco }, action: any) => {
  switch (action.type) {
    case 'SET_CACHE':
      return { ...state, [action.cep]: action.endereco };
    default:
      return state;
  }
};

const App = () => {
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState<Endereco | null>(null);
  const [enderecosSalvos, setEnderecosSalvos] = useState<Endereco[]>([]);
  const [cache, dispatch] = useReducer(cacheReducer, {});

  useEffect(() => {
    const enderecosArmazenados = localStorage.getItem("enderecos");
    const cacheArmazenado = localStorage.getItem("cacheCep");

    if (enderecosArmazenados) {
      setEnderecosSalvos(JSON.parse(enderecosArmazenados));
    }
    if (cacheArmazenado) {
      dispatch({ type: 'SET_CACHE', cep: '', endereco: JSON.parse(cacheArmazenado) });
    }
  }, []);

  const consultarCEP = async () => {
    if (cep.length !== 8) {
      alert("CEP inválido. Digite um CEP com 8 dígitos.");
      return;
    }

    if (cache[cep]) {
      console.log("CEP carregado do cache:", cache[cep]);
      setEndereco(cache[cep]);
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        alert("CEP não encontrado!");
        return;
      }

      const novoEndereco: Endereco = {
        cep: data.cep,
        logradouro: data.logradouro,
        bairro: data.bairro,
        localidade: data.localidade,
        uf: data.uf,
      };

      dispatch({ type: 'SET_CACHE', cep, endereco: novoEndereco });
      localStorage.setItem("cacheCep", JSON.stringify({ ...cache, [cep]: novoEndereco }));

      setEndereco(novoEndereco);
    } catch (error) {
      console.error("Erro ao consultar CEP:", error);
      alert("Erro na consulta. Tente novamente.");
    }
  };

  const salvarEndereco = () => {
    if (!endereco) return;

    const novosEnderecos = [...enderecosSalvos, endereco];
    setEnderecosSalvos(novosEnderecos);
    localStorage.setItem("enderecos", JSON.stringify(novosEnderecos));
    setEndereco(null);
    setCep("");
  };

  const removerEndereco = (index: number) => {
    const novosEnderecos = enderecosSalvos.filter((_, i) => i !== index);
    setEnderecosSalvos(novosEnderecos);
    localStorage.setItem("enderecos", JSON.stringify(novosEnderecos));
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-5 bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-4">Consulta de CEP</h1>
        <div className="mb-4">
          <input
            type="text"
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            placeholder="Digite o CEP"
            className="w-full p-2 border rounded-lg"
            maxLength={8}
          />
        </div>
        <button
          onClick={consultarCEP}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          Consultar
        </button>

        {endereco && (
          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <p><strong>CEP:</strong> {endereco.cep}</p>
            <p><strong>Logradouro:</strong> {endereco.logradouro}</p>
            <p><strong>Bairro:</strong> {endereco.bairro}</p>
            <p><strong>Cidade:</strong> {endereco.localidade} - {endereco.uf}</p>

            <button
              onClick={salvarEndereco}
              className="mt-3 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
            >
              Salvar
            </button>
          </div>
        )}
      </div>

      {enderecosSalvos.length > 0 && (
        <div className="bg-white p-6 mt-5 rounded-xl shadow-md w-full max-w-lg">
          <h2 className="text-xl font-bold text-center mb-4">Endereços Salvos</h2>
          <ul>
            {enderecosSalvos.map((end, index) => (
              <li key={index} className="border-b py-2 flex justify-between items-center">
                <div>
                  <p className="text-sm">{end.cep} - {end.logradouro}, {end.bairro}, {end.localidade} - {end.uf}</p>
                </div>
                <button
                  onClick={() => removerEndereco(index)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
