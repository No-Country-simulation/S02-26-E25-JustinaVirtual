import { useEffect } from 'react';
import { useTrainingSession } from '../contexts/TrainingSessionContext';
import TrainingHUD from '../components/hud/TrainingHUD';
import QuestionMultipleChoice from '../components/training/QuestionMultipleChoice';
import ImagemRimPelveRenal from '../assets/ImagemRimPelveRenal.jpg';

const videoQuestions = [
  {
    id: 'v1',
    text: 'Qual estrutura anatômica é mais frequentemente preservada na nefrectomia parcial?',
    options: ['Artéria renal principal', 'Veia renal', 'Ureter', 'Cápsula de Gerota'],
    correctIndex: 0,
    hint: 'A preservação dos vasos principais é fundamental para manter a função do rim remanescente.',
    topic: 'Anatomia renal'
  },
  {
    id: 'v2',
    text: 'Qual é a principal vantagem da abordagem minimamente invasiva em cirurgia renal?',
    options: [
      'Menor tempo cirúrgico',
      'Menor perda sanguínea e recuperação mais rápida',
      'Menor custo do procedimento',
      'Maior taxa de complicações'
    ],
    correctIndex: 1,
    hint: 'A redução do trauma cirúrgico é o principal benefício clínico.',
    topic: 'Técnicas minimamente invasivas'
  }
];

const imageQuestions = [
  {
    id: 'i1',
    text: 'Na imagem, qual estrutura está sendo apontada pela seta vermelha?',
    options: ['Pelve renal', 'Cálices maiores', 'Córtex renal', 'Medula renal'],
    correctIndex: 0,
    hint: 'A pelve renal coleta a urina antes de chegar ao ureter.',
    topic: 'Anatomia renal'
  },
  {
    id: 'i2',
    text: 'Qual tipo de tumor é mais adequado para nefrectomia parcial com base na localização?',
    options: ['Tumor central invadindo hilo', 'Tumor exofítico no polo inferior', 'Tumor maior que 7 cm', 'Tumor bilateral sincrônico'],
    correctIndex: 1,
    hint: 'Tumores periféricos e exofíticos são ideais para preservação de parênquima.',
    topic: 'Indicações cirúrgicas'
  }
];

const caseQuestions = [
  {
    id: 'c1',
    text: 'Paciente de 58 anos com tumor de 3,2 cm no polo inferior do rim direito. Função renal preservada. Qual a melhor conduta?',
    options: [
      'Nefrectomia radical imediata',
      'Nefrectomia parcial por via robótica ou laparoscópica',
      'Ablação por radiofrequência',
      'Vigilância ativa independente do crescimento'
    ],
    correctIndex: 1,
    hint: 'Tumor < 4 cm em localização favorável → nefrectomia parcial é a opção preferencial.',
    topic: 'Decisão clínica'
  }
];

export default function TrainingSessionPage() {
  const video1 = "https://www.youtube.com/embed/fELn4Fe9Ccc"; 
  const imagem1 = ImagemRimPelveRenal; 
  const context = useTrainingSession();

  if (!context) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-950">
        Erro: Contexto de treinamento não encontrado.
      </div>
    );
  }

  const { session, startSession, recordAnswer, currentStep, finishStep, finishSession } = context;

  useEffect(() => {
    if (!session) {
      startSession('Anatomia e Indicações em Cirurgia Renal', 'trainee-' + Date.now());
    }
  }, [session, startSession]);

  const handleAnswer = (answer) => {
    recordAnswer(answer);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-950">
        Iniciando sessão de treinamento...
      </div>
    );
  }

  const getCurrentQuestions = () => {
    if (currentStep === 0) return videoQuestions;
    if (currentStep === 1) return imageQuestions;
    if (currentStep === 2) return caseQuestions;
    return [];
  };

  const allQuestionsAnswered = () => {
    const questions = getCurrentQuestions();
    const answeredInStep = session.answers.filter(a => 
      questions.some(q => q.id === a.questionId)
    );
    return answeredInStep.length >= questions.length;
  };

  const renderStepContent = () => {
    if (currentStep > 2) {
      return (
        <div className="text-center py-12">
          <h2 className="text-4xl font-bold text-green-400 mb-6">
            Treinamento concluído!
          </h2>
          <p className="text-2xl mb-8">
            Pontuação: {session.totalScore} / {session.answers.length}
          </p>
          <p className="text-xl mb-10 text-gray-300">
            Tempo total: {Math.floor(session.totalTimeMs / 60000)} min
          </p>
          <button
            onClick={finishSession}
            className="px-10 py-5 bg-purple-600 hover:bg-purple-700 rounded-lg text-xl font-medium"
          >
            Finalizar e salvar sessão
          </button>
        </div>
      );
    }

    const title = [
      "Etapa 1 – Vídeo introdutório",
      "Etapa 2 – Interpretação de imagem",
      "Etapa 3 – Caso clínico"
    ][currentStep];

    const description = [
      "Assista ao vídeo e responda às questões abaixo.",
      "Analise a imagem e responda com base no que observa.",
      "Leia o caso clínico e escolha a melhor conduta."
    ][currentStep];

    return (
      <div>
        <h2 className="text-3xl font-bold mb-6">{title}</h2>
        <p className="text-lg text-gray-300 mb-8">{description}</p>

        {currentStep === 0 && (
          <div className="mb-12 bg-black rounded-lg overflow-hidden aspect-video max-w-4xl mx-auto">
            <iframe
              width="100%"
              height="100%"
              src={video1}
              title="Vídeo introdutório - Cirurgia Renal"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {currentStep === 1 && (
          <div className="mb-12 bg-gray-800 rounded-lg p-6 max-w-4xl mx-auto text-center">
            <div className="h-96 bg-gray-700 flex items-center justify-center rounded mb-6">
              <img src={imagem1} alt="Anatomia Renal" className="max-h-96 mx-auto rounded" />
            </div>
            <p className="text-gray-400 italic">
              (Análise de imagem anatômica com marcações)
            </p>
          </div>
        )}

        {currentStep === 2 && (
          <div className="mb-12 bg-gray-800 rounded-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold mb-6">Caso clínico</h3>
            <p className="text-lg leading-relaxed text-gray-200">
              Paciente masculino, 58 anos, tabagista, hipertenso, com achado incidental em tomografia 
              de tumor sólido de 3,2 cm no polo inferior do rim direito, sem invasão de veia renal 
              nem linfonodomegalias. Creatinina basal 0,9 mg/dL. Risco cirúrgico ASA II.
            </p>
          </div>
        )}

        <div className="mt-10">
          <h3 className="text-2xl font-semibold mb-8">Questões</h3>
          <div className="space-y-12">
            {getCurrentQuestions().map(q => (
              <QuestionMultipleChoice
                key={q.id}
                question={q}
                onAnswer={handleAnswer}
              />
            ))}
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={finishStep}
            disabled={!allQuestionsAnswered()}
            className={`
              px-10 py-5 rounded-xl text-xl font-medium transition
              ${allQuestionsAnswered()
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-700 cursor-not-allowed opacity-60'}
            `}
          >
            {currentStep === 2 ? 'Finalizar Treinamento' : 'Avançar para próxima etapa'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white relative pb-20">
      <TrainingHUD />

      <div className="container mx-auto pt-28 pb-16 px-6 max-w-6xl">
        <h1 className="text-4xl font-bold mb-10 text-center">
          Treinamento Teórico – Cirurgia Renal
        </h1>

        {renderStepContent()}
      </div>
    </div>
  );
}