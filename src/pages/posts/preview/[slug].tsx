import { GetStaticProps } from "next"
import { getSession, useSession } from "next-auth/react"
import { getPrismicCLient } from "../../../services/prismic"
import * as PrismicHelpers from '@prismicio/helpers'
import Head from "next/head"

import styles from '../post.module.scss'
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect } from "react"

interface PostPreviewProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  }
}

export default function PostPreview({ post }: PostPreviewProps) {
  const { data: sessionData } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (sessionData?.activeSubscription) {
      router.push(`/posts/${post.slug}`)
    }
  }, [sessionData])

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
            className={`${styles.postContent} ${styles.previewContent} `}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/">
              <a>Subscribe now 🤗</a>
            </Link>
          </div>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicCLient()

  const response = await prismic.getByUID('publication', String(slug), {})

  const post = {
    slug,
    title: PrismicHelpers.asText(response.data.title),
    content: PrismicHelpers.asHTML(response.data.content.splice(0, 3)),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }
  return {
    props: {
      post
    },
    revalidate: 60 * 30 //minutos
  }
}