// src/mocks/questions.js
const now = new Date().toISOString();

export const mockQuestions = [
  // Video questions (your original data + media_url)
  {
    id: 'v1',
    type: 'video',
    text: 'Qual estrutura anatômica é mais frequentemente preservada na nefrectomia parcial?',
    options: ['Artéria renal principal', 'Veia renal', 'Ureter', 'Cápsula de Gerota'],
    correctIndex: 0,
    hint: 'A preservação dos vasos principais é fundamental para manter a função do rim remanescente.',
    topic: 'Anatomia renal',
    media_url: null, // question-specific video (optional)
    created_at: now,
    modified_at: now,
    active: true,
    status: 'enabled',
    version: 1
  },
  {
    id: 'v2',
    type: 'video',
    text: 'Qual é a principal vantagem da abordagem minimamente invasiva em cirurgia renal?',
    options: [
      'Menor tempo cirúrgico',
      'Menor perda sanguínea e recuperação mais rápida',
      'Menor custo do procedimento',
      'Maior taxa de complicações'
    ],
    correctIndex: 1,
    hint: 'A redução do trauma cirúrgico é o principal benefício clínico.',
    topic: 'Técnicas minimamente invasivas',
    media_url: null,
    created_at: now,
    modified_at: now,
    active: true,
    status: 'enabled',
    version: 1
  },

  // Image questions
  {
    id: 'i1',
    type: 'image',
    text: 'Na imagem, qual estrutura está sendo apontada pela seta vermelha?',
    options: ['Pelve renal', 'Cálices maiores', 'Córtex renal', 'Medula renal'],
    correctIndex: 0,
    hint: 'A pelve renal coleta a urina antes de chegar ao ureter.',
    topic: 'Anatomia renal',
    media_url: '/assets/ImagemRimPelveRenal.jpg',
    created_at: now,
    modified_at: now,
    active: true,
    status: 'enabled',
    version: 1
  },
  {
    id: 'i2',
    type: 'image',
    text: 'Qual tipo de tumor é mais adequado para nefrectomia parcial com base na localização?',
    options: ['Tumor central invadindo hilo', 'Tumor exofítico no polo inferior', 'Tumor maior que 7 cm', 'Tumor bilateral sincrônico'],
    correctIndex: 1,
    hint: 'Tumores periféricos e exofíticos são ideais para preservação de parênquima.',
    topic: 'Indicações cirúrgicas',
    media_url: null,
    created_at: now,
    modified_at: now,
    active: true,
    status: 'enabled',
    version: 1
  },

  // Case questions
  {
    id: 'c1',
    type: 'case',
    text: 'Paciente de 58 anos com tumor de 3,2 cm no polo inferior do rim direito. Função renal preservada. Qual a melhor conduta?',
    options: [
      'Nefrectomia radical imediata',
      'Nefrectomia parcial por via robótica ou laparoscópica',
      'Ablação por radiofrequência',
      'Vigilância ativa independente do crescimento'
    ],
    correctIndex: 1,
    hint: 'Tumor < 4 cm em localização favorável → nefrectomia parcial é a opção preferencial.',
    topic: 'Decisão clínica',
    media_url: null, // could be PDF later
    created_at: now,
    modified_at: now,
    active: true,
    status: 'enabled',
    version: 1
  }
];

// Helper: get question by ID
export const getQuestionById = (id) => mockQuestions.find(q => q.id === id);