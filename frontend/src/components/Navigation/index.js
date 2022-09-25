// // frontend/src/components/Navigation/index.js
// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import ProfileButton from './ProfileButton';
// import LoginFormModal from '../LoginFormModal';
// import './Navigation.css';
// import LoginDemoUser from '../DemoUser';
// import logo from '../Navigation/logo.png';

// function Navigation({ isLoaded }) {
//     const sessionUser = useSelector(state => state.session.user);

//     let sessionLinks;
//     if (sessionUser) {
//         sessionLinks = (
//             <ProfileButton user={sessionUser} />
//         );
//     } else {
//         sessionLinks = (
//             <>
//                 <LoginDemoUser />
//                 <LoginFormModal />
//                 <NavLink className='button-signup' to="/signup">Sign Up</NavLink>
//             </>
//         );
//     }
//     return (
//         // <ul>
//         //     <li>
//         //         <NavLink exact to="/">Home</NavLink>
//         //         {isLoaded && sessionLinks}
//         //     </li>
//         // </ul>

//         <div className={sessionUser ? "navbar logged-in" : 'navbar logged-out'}>
//             <div className='logo-container'>
//                 <NavLink exact to='/'>
//                     <img className='logo' src={logo}></img>
//                 </NavLink>
//             </div>
//             <div className='nav-buttons'>
//                 {isLoaded && sessionLinks}
//             </div>
//         </div>
//     );
// }

// export default Navigation;

// frontend/src/components/Navigation/index.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import LoginFormModal from '../LoginFormModal';
import './Navigation.css';
import LoginDemoUser from '../DemoUser';
import logo from '../Navigation/logo.png';

function Navigation({ isLoaded }) {
    const sessionUser = useSelector(state => state.session.user);

    let sessionLinks;
    if (sessionUser) {
        sessionLinks = (
            <>
                <div className='right-navbar'>
                <div className='new-group-container'> <NavLink className='new-group' to={`/groups/new`}>Create your group</NavLink></div>
                    <div className='button-profile'> <ProfileButton user={sessionUser} /></div>

                </div>
            </>
        );
    } else {
        sessionLinks = (
            <>
                <LoginDemoUser />
                <LoginFormModal />
                <NavLink className='button-signup' to="/signup">Sign Up</NavLink>
            </>
        );
    }
    return (
        // <ul>
        //     <li>
        //         <NavLink exact to="/">Home</NavLink>
        //         {isLoaded && sessionLinks}
        //     </li>
        // </ul>

        <div className={sessionUser ? "navbar logged-in" : 'navbar logged-out'}>
            <div className='logo-container'>
                <NavLink exact to='/'>
                    <img className='logo' src={logo}></img>
                </NavLink>
            </div>
            <div className='nav-buttons'>
                {isLoaded && sessionLinks}
            </div>
        </div>
    );
}

export default Navigation;
