import { useSelector } from "react-redux";
import Groups from "../Groups";

export default function WelcomePage() {
    const sessionUser = useSelector(state => state.session.user);
    return (
        <>
            <h1>Welcome back, {sessionUser.firstName}!</h1>
            <Groups />
        </>
    )
}
