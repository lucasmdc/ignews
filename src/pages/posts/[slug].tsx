import { GetServerSideProps } from "next"
import { getSession } from "next-auth/react"
import { getPrismicCLient } from "../../services/prismic"
import * as PrismicHelpers from '@prismicio/helpers'
import Head from "next/head"

import styles from './post.module.scss'

interface PostProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  }
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <Head>
        <title>{post.title} | ignews</title>
      </Head>
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
  const session = await getSession({ req })
  const { slug } = params;

  if (!session?.activeSubscription) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  const prismic = getPrismicCLient(req)

  const response = await prismic.getByUID('publication', String(slug), {})

  const post = {
    slug,
    title: PrismicHelpers.asText(response.data.title),
    content: PrismicHelpers.asHTML(response.data.content),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }
  return {
    props: {
      post
    }
  }
}