import { useSelector } from "react-redux";
import Groups from "../Groups";
import './WelcomePage.css';
export default function WelcomePage() {
    const sessionUser = useSelector(state => state.session.user);
    return (
        <>
            <div className='welcome-top-container'>
                <h1 className='message'>Welcome, {sessionUser.firstName} 👋</h1>
            </div>
            <Groups />
        </>
    )
}
