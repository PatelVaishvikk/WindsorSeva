// pages/_app.js
import React, { useEffect } from 'react';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import DarkModeToggle from '@/components/DarkModeToggle';
import Navigation from '../components/Navbar';
// import ChatWidget from '../components/ChatWidget'; // Import the Chat Widget

const MyApp = ({ Component, pageProps }) => {
    useEffect(() => {
        // Import bootstrap JS on client-side using dynamic import
        import('bootstrap/dist/js/bootstrap.bundle.min.js');
    }, []);

    return (
        <>
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
                 
        {/* Favicon */}

            </Head>
            {/* <Navigation />  */}
            <div className="app-container">
                {/* Render the main app component */}
                <Component {...pageProps} />
            </div>

            {/* Render the floating Chat Widget globally */}
            {/* <ChatWidget /> */}

            <style jsx global>{`
                body {
                    background-color: #f8f9fc;
                    color: #2e3a46;
                }

                .app-container {
                    min-height: 100vh;
                }

                .main-content {
                    padding: 2rem 0;
                }

                .card {
                    border: none;
                    border-radius: 0.5rem;
                    box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
                }

                .btn {
                    font-weight: 500;
                }

                .form-control:focus,
                .form-select:focus {
                    border-color: #4e73df;
                    box-shadow: 0 0 0 0.25rem rgba(78, 115, 223, 0.25);
                }

                .table th {
                    font-weight: 600;
                    background-color: #f8f9fc;
                }

                .badge {
                    font-weight: 500;
                }

                .modal-content {
                    border: none;
                    border-radius: 0.5rem;
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
                }

                .modal-header {
                    border-bottom: 1px solid #e3e6f0;
                    background-color: #f8f9fc;
                    border-radius: 0.5rem 0.5rem 0 0;
                }

                .modal-footer {
                    border-top: 1px solid #e3e6f0;
                    background-color: #f8f9fc;
                    border-radius: 0 0 0.5rem 0.5rem;
                }
            `}</style>
             <DarkModeToggle />

        </>
    );
};

export default MyApp;
