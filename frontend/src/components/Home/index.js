import { useSelector } from "react-redux"
import HomePage from "../HomePage";
import WelcomePage from "../WelcomePage";

export default function Home() {
    const sessionUser = useSelector(state=> state.session.user);
    console.log(sessionUser, 'SESSION USER');
    return (
            sessionUser?<WelcomePage/> : <HomePage/>

    )
}
