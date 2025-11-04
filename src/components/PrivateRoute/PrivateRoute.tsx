import { Outlet, Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { RootState } from '../../store';

const PrivateRoute = () => {
    const { isLoggedIn, hasResolvedAuth } = useAppSelector((state: RootState) => state.auth);

    if (!hasResolvedAuth) {
        return null;
    }

    if (!isLoggedIn) {
        return <Navigate to="/roadmaps" replace />;
    }

    return <Outlet />;
}

export default PrivateRoute;
