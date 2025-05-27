import Link from 'next/link';

export default function SignInPage() {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h1>Sign In</h1>
                <form>
                    <input type="text" placeholder="Username" />
                    <input type="password" placeholder="Password" />
                    <Link href="../dashboard/root">
                        <button type="submit">Sign In</button>
                    </Link>
                </form>
            </div>
            <div>
                <p>Don't have an account? <Link href="../authentication/signUp">Sign Up</Link></p>
            </div>
            <div>
                <Link href="../authentication/forgotPassword">Forgot Password?</Link>
            </div>
        </div>
    );
}