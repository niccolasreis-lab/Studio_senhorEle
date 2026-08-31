-- Seed dos 7 veículos-base, apontando para imagens no Storage público.
-- Padrão de URL: https://rucqvvollyrlgyekoelq.supabase.co/storage/v1/object/public/vehicle-images/<arquivo>
insert into public.custom_vehicles (id, share_id, title, subtitle, image, image2, image3, year, engine, transmission, color, power, "condition", description, is_custom) values

('porsche-911', 'SRL-911-1973', 'Porsche 911 Classic', 'Matching Numbers • 1973',
 'https://rucqvvollyrlgyekoelq.supabase.co/storage/v1/object/public/vehicle-images/porsche-911-classic-1973.jpg', '', '',
 '1973', '2.4L Flat-6 Boxer', 'Manual 5 Marchas', 'Guards Red Original', '190 cv',
 'Restaurado Concours d''Elegance',
 'Exemplar ícone da engenharia alemã com números de chassi e motor 100% correspondentes. Interior em couro preto e rodas Fuchs de época.', false),

('vw-kombi', 'SRL-KMB-1970', 'VW Kombi Corujinha', 'Restored Heritage • 1970',
 'https://rucqvvollyrlgyekoelq.supabase.co/storage/v1/object/public/vehicle-images/vw-kombi-corujinha-1970.jpg', '', '',
 '1970', '1500cc Air-Cooled', 'Manual 4 Marchas', 'Saia e Blusa Turquesa e Branco', '52 cv',
 'Colecionável Placa Preta', 'Restauração minuciosa no padrão de fábrica. Tapeçaria em tom palha, janelas saia e blusa impecáveis e motor 1500cc revisado.', false),

('vw-fusca-cal', 'SRL-FSC-1968', 'VW Fusca Cal Style', 'Air Cooled Custom • 1968',
 'https://rucqvvollyrlgyekoelq.supabase.co/storage/v1/object/public/vehicle-images/vw-fusca-cal-style-1968.jpg', '', '',
 '1968', '1600cc Dupla Carburação', 'EMPI Rápida 4 Marchas', 'Verde Tahiti Múltiplos Tons', '65 cv',
 'Customizado Cal-Look Vintage', 'Estilo clássico da califórnia anos 60. Suspensão catracada, rodas BRM originais e mecânica boxer retrabalhada.', false),

('aero-willys', 'SRL-AWL-1967', 'Aero Willys', 'Original Impecável • 1967',
 'https://rucqvvollyrlgyekoelq.supabase.co/storage/v1/object/public/vehicle-images/aero-willys-1967.jpg', '', '',
 '1967', '2600 6 Cilindros em Linha', 'Manual 4 Marchas Coluna', 'Azul Boreal Metálico', '110 cv',
 'Acervo de Época', 'Sedã executivo de luxo nacional com motor 6 cilindros em linha. Painel e mostradores em jacarandá preservados.', false),

('aircooled-box-767', 'SRL-BOX-1976', 'Air Cooled Box 767', 'German Vintage Engineering • 1976',
 'https://rucqvvollyrlgyekoelq.supabase.co/storage/v1/object/public/vehicle-images/aircooled-box-767.jpg', '', '',
 '1976', '2.0L Boxer Air-Cooled', 'Manual 5 Marchas', 'Cinza Nardo Acetinado', '105 cv',
 'Tuning de Época', 'Projeto exclusivo com preparação esportiva para motores boxer refrigerados a ar. Coletor em inox e instrumentos de precisão.', false),

('vw-fusca-1994', 'SRL-FSC-1994', 'VW Fusca Itamar', 'Edição Especial de Coleção • 1994',
 'https://rucqvvoljvjyvkoelq.supabase.co/storage/v1/object/public/vehicle-images/vw-fusca-cal-style-1968.jpg', '', '',
 '1994', '1600cc Catalisado Air-Cooled', 'Manual 4 Marchas', 'Verde Tahiti Múltiplos Tons', '58 cv',
 '100% Selado e Preservado', 'Raro exemplar da série de religamento presidencial de 1994. Tapeçaria xadrez original, volante de dois raios e manual carimbado.',
 'true'),

('porsche-911-carrera-1989', 'SRL-911-1989', 'Porsche 911 Carrera 3.2', 'G50 Gearbox Classic • 1989',
 'https://rucqvvoljrlvggkohq.supabase.co/storage/v1/object/public/vehicle-images/porsche-911-classic-1973.jpg', '', '',
 '1989', '3.2L Flat-6 Boxer (217 cv)', 'Manual 5 Marchas (Câmbio G50)', 'Preto Cadillac Brilhante', '217 cv',
 'Edição Especial G50', 'O ápice da era clássica dos Porsche 911 arrefecidos a ar com o cobiçado câmbio Getrag G50.',
 'false');
