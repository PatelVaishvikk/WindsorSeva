import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                {/* Meta tags for SEO */}
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="HSAPSS Windsor - Dashboard and Student Management" />
                <meta name="author" content="HSAPSS Windsor" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

                {/* External FontAwesome & Bootstrap CDN links */}
                <link
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
                    rel="stylesheet"
                />
                <link
                    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
                    rel="stylesheet"
                />

                {/* Optionally, include any additional meta tags, links, etc. */}
            </Head>
            <body>
                <Main />
                <NextScript />
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
            </body>
        </Html>
    );
}
