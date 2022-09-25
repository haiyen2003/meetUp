import { useSelector } from "react-redux";
import Groups from "../Groups";
import './WelcomePage.css';
export default function WelcomePage() {
    const sessionUser = useSelector(state => state.session.user);
    return (
        <>
            <div className='top-container'>
                <h1 className='message'>Welcome back, {sessionUser.firstName} 👋</h1>
            </div>
            <Groups />
        </>
    )
}
