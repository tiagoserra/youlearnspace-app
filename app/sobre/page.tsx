'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import YouTubeLayout from '@/components/layout/YouTubeLayout'
import styles from './page.module.css'

const steps = [
  {
    title: 'Explore',
    description: 'Navegue por nossa curadoria especializada de cursos gratuitos em diversas áreas do conhecimento.',
    image: '/images/student-class-looking-course.jpg',
    alt: 'Turma observando conteúdo educacional em uma sala de aula',
  },
  {
    title: 'Escolha',
    description: 'Encontre o curso perfeito para você, seja para iniciar uma nova carreira ou aprimorar suas habilidades.',
    image: '/images/close-up-hand-taking-notes.jpg',
    alt: 'Pessoa fazendo anotações enquanto avalia alternativas de estudo',
  },
  {
    title: 'Aprenda',
    description: 'Assista aos cursos gratuitamente no YouTube, no seu ritmo e quando quiser. Marque seu progresso!',
    image: '/images/woman-sitting-with-opened-laptop-headphones.jpg',
    alt: 'Mulher estudando com notebook e fones de ouvido',
  },
  {
    title: 'Compartilhe',
    description: 'Encontrou um curso incrível? Sugira para nossa comunidade e ajude outras pessoas a crescerem!',
    image: '/images/fim-cima-adolescente-menina-pisar-livros.jpg',
    alt: 'Logotipo do YouLearnSpace representando acompanhamento de estudos',
  },
]

export default function SobrePage() {
  const pathname = usePathname()

  return (
    <YouTubeLayout currentPath={pathname}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <h1>Sobre o YouLearnSpace</h1>
          <p>Seja o Protagonista do Seu Futuro</p>
        </section>

        <section className={styles.section}>
          <h2>Nossa Missão</h2>
          <p>
            A plataforma YouLearnSpace é para você que é protagonista do seu futuro. Acreditamos que educação de qualidade deve ser acessível a todos, e o YouTube se tornou uma das maiores bibliotecas de conhecimento do mundo.
            Nossa missão é fazer a curadoria desses cursos, filtrando e destacando conteúdos que realmente fazem a diferença na sua jornada de aprendizado. Queremos facilitar sua busca por conhecimento de qualidade, reunindo tudo em um só lugar.
            Além disso, você também pode fazer parte dessa comunidade sugerindo cursos que julga serem interessantes e que podem ajudar outras pessoas em suas jornadas.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Como Funciona</h2>
          <div className={styles.steps}>
            {steps.map((step, index) => (
              <div key={step.title} className={styles.step}>
                <div className={styles.stepImageWrapper}>
                  <Image
                    src={step.image}
                    alt={step.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className={styles.stepImage}
                  />
                </div>
                <h3>{`${index + 1}. ${step.title}`}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Por Que YouLearnSpace?</h2>
          <ul>
            <li><strong>100% Gratuito:</strong> Todos os cursos que selecionamos são totalmente gratuitos. Educação de qualidade não deve ter barreiras financeiras.</li>
            <li><strong>Curadoria Especializada:</strong> Nossa equipe analisa e seleciona apenas cursos que realmente agregam valor, economizando seu tempo na busca.</li>
            <li><strong>Aprenda no Seu Ritmo:</strong> Sem pressão, sem prazos. Você decide quando e como estudar, no conforto da sua casa.</li>
            <li><strong>Comunidade Colaborativa:</strong> Faça parte de uma comunidade que valoriza o conhecimento compartilhado e o crescimento coletivo.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>O Que Oferecemos</h2>
          <p style={{
            fontSize: `1.1rem`,
            lineHeight: `1.8`,
            color: `var(--text-secondary)`,
            marginBottom: `1.5rem`,
          }}>
            Atualmente, estamos focados em captar e curar cursos do YouTube, a maior plataforma de vídeos do mundo. Com milhares de horas de conteúdo educacional disponível, nossa função é destacar o que realmente vale a pena.
          </p>
          <ul style={{
            fontSize: `1.1rem`,
            lineHeight: `2`,
            color: `var(--text-secondary)`,
            listStyle: `none`,
            padding: 0,
          }}>
            <li style={{
              marginBottom: `1rem`,
              paddingLeft: `2rem`,
              position: `relative`,
            }}>
              <span style={{
                position: `absolute`,
                left: 0,
                color: `#FF0000`,
                fontWeight: `bold`,
                fontSize: `1.2rem`,
              }}>✓</span>
              Cursos de Programação e Desenvolvimento
            </li>
            <li style={{
              marginBottom: `1rem`,
              paddingLeft: `2rem`,
              position: `relative`,
            }}>
              <span style={{
                position: `absolute`,
                left: 0,
                color: `#0066FF`,
                fontWeight: `bold`,
                fontSize: `1.2rem`,
              }}>✓</span>
              Tecnologia e Inovação
            </li>
            <li style={{
              marginBottom: `1rem`,
              paddingLeft: `2rem`,
              position: `relative`,
            }}>
              <span style={{
                position: `absolute`,
                left: 0,
                color: `#FFD700`,
                fontWeight: `bold`,
                fontSize: `1.2rem`,
              }}>✓</span>
              Design e Criatividade
            </li>
            <li style={{
              marginBottom: `1rem`,
              paddingLeft: `2rem`,
              position: `relative`,
            }}>
              <span style={{
                position: `absolute`,
                left: 0,
                color: `#FF0000`,
                fontWeight: `bold`,
                fontSize: `1.2rem`,
              }}>✓</span>
              Negócios e Empreendedorismo
            </li>
            <li style={{
              marginBottom: `1rem`,
              paddingLeft: `2rem`,
              position: `relative`,
            }}>
              <span style={{
                position: `absolute`,
                left: 0,
                color: `#0066FF`,
                fontWeight: `bold`,
                fontSize: `1.2rem`,
              }}>✓</span>
              E muito mais...
            </li>
          </ul>
        </section>
        
      </div>
    </YouTubeLayout>
  )
}
