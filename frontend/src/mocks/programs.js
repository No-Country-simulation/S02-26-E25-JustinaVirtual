// src/mocks/programs.js
import ImagemRimPelveRenal from '../assets/ImagemRimPelveRenal.jpg';
export const programDefault = {
  id: 'program-default',
  name: 'Programa Padrão – Anatomia e Indicações em Cirurgia Renal',
  description: 'Conjunto básico de treinamento para novos usuários (fallback)',
  
  // Main media & descriptions per step
  main_video_url: 'https://www.youtube.com/embed/fELn4Fe9Ccc',
  video_description: 'Assista ao vídeo introdutório sobre anatomia renal e responda às questões abaixo.',
  
  main_image_url: ImagemRimPelveRenal,
  image_description: 'Analise a imagem anatômica do rim e responda com base no que observa.',
  
  main_case_url: null,
  case_description: 'Leia o caso clínico e escolha a melhor conduta cirúrgica.',

  created_at: new Date('2026-02-01T10:00:00Z').toISOString(),
  modified_at: new Date('2026-02-01T10:00:00Z').toISOString(),
  active: true,
  status: 'enabled',
  version: 1,
  author_id: 'admin-001',
  last_modified_by: 'admin-001',

  // Relations: ordered questions (simulates program_questions table)
  question_links: [
    // Video step
    { question_id: 'v1', order_index: 1 },
    { question_id: 'v2', order_index: 2 },
    
    // Image step
    { question_id: 'i1', order_index: 3 },
    { question_id: 'i2', order_index: 4 },
    
    // Case step
    { question_id: 'c1', order_index: 5 }
  ]
};

// Export all programs (add more later)
export const allPrograms = [programDefault];