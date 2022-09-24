<<<<<<< HEAD
import { useSelector } from "react-redux"
import HomePage from "../HomePage";
import WelcomePage from "../WelcomePage";

export default function Home() {
    const sessionUser = useSelector(state=> state.session.user);
    console.log(sessionUser, 'SESSION USER');
    return (
            sessionUser?<WelcomePage/> : <HomePage/>

=======
import WelcomePage from "../WelcomePage";
import {useSelector} from 'react-redux';
import HomePage from "../HomePage";

export default function Home() {
    const sessionUser = useSelector(state => state.session.user);
    return (
       sessionUser?<WelcomePage/>:<HomePage/>
>>>>>>> 6f4e6872fc73768597fff9cbcc84700f33f61549
    )
}
