import WelcomePage from "../WelcomePage";
import {useSelector} from 'react-redux';
import HomePage from "../HomePage";

export default function Home() {
    const sessionUser = useSelector(state => state.session.user);
    return (
       sessionUser?<WelcomePage/>:<HomePage/>
    )
}
