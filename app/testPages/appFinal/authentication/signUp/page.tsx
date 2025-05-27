import Link from "next/link";

export default function SignUpPage() {
    return (
        <div>
            <h1>Sign Up</h1>
            <form action="">
                <input type="text" placeholder="Username" />
                <input type="password" placeholder="Password" />
                <input type="password" placeholder="Confirm Password" />
                <Link href="../onboarding/name">
                    <button type="submit">Sign Up</button>
                </Link>
            </form>
            <div>
                <p>Already have an account? <Link href="../authentication/signIn">Sign In</Link></p>
            </div>
        </div>
    );
}