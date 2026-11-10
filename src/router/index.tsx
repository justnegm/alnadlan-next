import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { lazyRetry } from "../lib/helpers";
import { createBrowserRouter } from "react-router";
import MainLayout from "../components/layouts/mainlayout";
import AuthLayout from "../components/layouts/authlayout";
import LandingLayout from "../components/layouts/landinglayout";
import AuthProtectedRoute from "./AuthProtectedRoute";
import ProtectedRoute from "./ProtectedRoute";
import Loader from "@/components/ui/loader";
import Error from "@/pages/error";

const Loading: ReactNode = (
    <Loader />
);

const ErrorFallback: ReactNode = (
    <Error />
);

// Auth
const Auth = lazy(() => lazyRetry(() => import("../pages/auth/auth")));
const Register = lazy(() => lazyRetry(() => import("../pages/auth/register")));
const ResetPassword = lazy(() => lazyRetry(() => import("../pages/auth/reset-password")));
const ResetPasswordConfirmation = lazy(() => lazyRetry(() => import("../pages/auth/reset-password-confirmation")));
const VerifyEmail = lazy(() => lazyRetry(() => import("../pages/auth/verify-email")));
const ResendEmail = lazy(() => lazyRetry(() => import("../pages/auth/resend-email")));


// Pages
const Home = lazy(() => lazyRetry(() => import("../pages/main/home")));
const Brokers = lazy(() => lazyRetry(() => import("../pages/main/brokers")));
const Projects = lazy(() => lazyRetry(() => import("../pages/main/projects")));
const ProjectDetails = lazy(() => lazyRetry(() => import("../pages/main/project-details")));
const Properties = lazy(() => lazyRetry(() => import("../pages/main/properties")));
const PropertyDetails = lazy(() => lazyRetry(() => import("../pages/main/property-details")));
const PropertyForm = lazy(() => lazyRetry(() => import("../pages/main/create-property")));
const LoanAdvicers = lazy(() => lazyRetry(() => import("../pages/main/loan-advicers")));
const Designers = lazy(() => lazyRetry(() => import("../pages/main/designers")));
const Lawyers = lazy(() => lazyRetry(() => import("../pages/main/lawyers")));
const TermsAndConditions = lazy(() => lazyRetry(() => import("../pages/main/terms-and-conditions")));
const PrivacyPolicy = lazy(() => lazyRetry(() => import("../pages/main/privacy-policy")));
const PeopleWithDisabilities = lazy(() => lazyRetry(() => import("../pages/main/people-with-disabli")));

const Landing = lazy(() => lazyRetry(() => import("../pages/landing")));

const Contact = lazy(() => lazyRetry(() => import("../pages/main/contact")));
const Designer = lazy(() => lazyRetry(() => import("../pages/main/designer")));
const Lawyer = lazy(() => lazyRetry(() => import("../pages/main/lawyer")));
const Advisor = lazy(() => lazyRetry(() => import("../pages/main/advisor")));
const Broker = lazy(() => lazyRetry(() => import("../pages/main/broker")));
const Office = lazy(() => lazyRetry(() => import("../pages/main/office")));
const Offices = lazy(() => lazyRetry(() => import("../pages/main/offices")));
const Profile = lazy(() => lazyRetry(() => import("../pages/main/profile")));
const ProfileEdit = lazy(() => lazyRetry(() => import("../pages/main/profile-edit")));
const UpdatePassword = lazy(() => lazyRetry(() => import("../pages/main/update-password")));


function withSuspense(node: ReactNode): ReactNode {
    return <Suspense fallback={Loading}>{node}</Suspense>;
}

const router = createBrowserRouter([
    {
        path: "/",
        errorElement: ErrorFallback,
        element: withSuspense(
            <MainLayout />
        ),
        children: [
            {
                index: true,
                element: withSuspense(<Home />),
            },
            {
                path: "profile",
                element: withSuspense(<ProtectedRoute> <Profile /></ProtectedRoute>),
            },
            {
                path: "profile/edit",
                element: withSuspense(<ProtectedRoute> <ProfileEdit /></ProtectedRoute>),
            },
            {
                path: "profile/change-password",
                element: withSuspense(<ProtectedRoute> <UpdatePassword /></ProtectedRoute>),
            },
            {
                path: "offices",
                element: withSuspense(<Offices />),
            },
            {
                path: "office/:id",
                element: withSuspense(<Office />),
            },
            {
                path: "brokers",
                element: withSuspense(<Brokers />),
            },
            {
                path: "brokers/:id",
                element: withSuspense(<Broker />),
            },
            {
                path: "projects",
                element: withSuspense(<Projects />),
            },
            {
                path: "project/:id",
                element: withSuspense(<ProjectDetails />),
            },
            {
                path: "properties",
                element: withSuspense(<Properties />),
            },
            {
                path: "property/:id",
                element: withSuspense(<PropertyDetails />),
            },
            {
                path: "property/create",
                element: withSuspense(<ProtectedRoute><PropertyForm /></ProtectedRoute>),
            },
            {
                path: "property/edit/:id",
                element: withSuspense(<ProtectedRoute><PropertyForm /></ProtectedRoute>),
            },
            {
                path: "loan-advisors",
                element: withSuspense(<LoanAdvicers />),
            },
            {
                path: "loan-advisors/:id",
                element: withSuspense(<Advisor />),
            },
            {
                path: "designers",
                element: withSuspense(<Designers />),
            },
            {
                path: "designers/:id",
                element: withSuspense(<Designer />),
            },
            {
                path: "lawyers",
                element: withSuspense(<Lawyers />),
            },
            {
                path: "lawyer/:id",
                element: withSuspense(<Lawyer />),
            },

            {
                path: "contact",
                element: withSuspense(<Contact />),
            },
            {
                path: "terms-and-conditions",
                element: withSuspense(<TermsAndConditions />),
            },
            {
                path: "privacy-policy",
                element: withSuspense(<PrivacyPolicy />),
            },
            {
                path: "people-with-disabilities",
                element: withSuspense(<PeopleWithDisabilities />),
            },
        ],
    },
    {
        path: "/landing",
        errorElement: ErrorFallback,
        element: withSuspense(
            <LandingLayout />
        ),
        children: [
            {
                index: true,
                element: withSuspense(<Landing />),
            }
        ]
    },
    {
        path: "/auth",
        errorElement: ErrorFallback,
        element: withSuspense(
            <AuthProtectedRoute>
                <AuthLayout />
            </AuthProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: withSuspense(<Auth />),
            },
            {
                path: "register",
                element: withSuspense(<Register />),
            },
            {
                path: "reset-password",
                element: withSuspense(<ResetPassword />),
            },
            {
                path: "password-reset-confirm/:uid/:token",
                element: withSuspense(<ResetPasswordConfirmation />),
            },
            {
                path: "verify-email/:key",
                element: withSuspense(<VerifyEmail />),
            },
            {
                path: "resend-email/",
                element: withSuspense(<ResendEmail />),
            }
        ],

    },
    {
        path: "*",
        element: withSuspense(<Error />),
    },
]);

export default router;