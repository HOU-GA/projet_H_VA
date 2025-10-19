import React, { useState, useEffect } from 'react';
import { Card, ProgressBar, Badge, Button, Collapse, Row, Col, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './GeneralStats.css';

const GeneralStats = () => {
    const activities = useSelector(state => state.activityReducer.activities || []);
    const currentUser = useSelector(state => state.authReducer?.user);
    
    const [stats, setStats] = useState({
        totalHours: 0,
        totalDays: 0,
        activityCount: 0,
        averageHoursPerDay: 0,
        weeklyHours: 0,
        monthlyHours: 0,
        identifiedActivities: 0
    });

    const [adminStats, setAdminStats] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [timeRange, setTimeRange] = useState('all'); // all, week, month, year

    const getConfig = () => ({
        headers: {
            authorization: localStorage.getItem("token")
        }
    });

    // Fonction pour calculer les heures
    const calculateHoursBetweenDates = (startDate, endDate, startTime, endTime) => {
        if (!startDate || !endDate || !startTime || !endTime) return 0;

        try {
            const start = new Date(startDate);
            const [startHours, startMinutes] = startTime.split(':').map(Number);
            start.setHours(startHours, startMinutes, 0, 0);

            const end = new Date(endDate);
            const [endHours, endMinutes] = endTime.split(':').map(Number);
            end.setHours(endHours, endMinutes, 0, 0);

            const diffMs = end - start;
            if (diffMs <= 0) return 0;

            const diffHours = diffMs / (1000 * 60 * 60);
            return Math.round(diffHours * 10) / 10;
        } catch (error) {
            console.error('❌ Erreur calcul durée:', error);
            return 0;
        }
    };

    // Fonction pour formater les heures
    const formatHours = (hours) => {
        if (hours === 0) return '0 ساعة';
        if (hours < 1) {
            const minutes = Math.round(hours * 60);
            return `${minutes} دقيقة`;
        } else if (hours === 1) {
            return 'ساعة واحدة';
        } else if (hours < 24) {
            return `${Math.round(hours * 10) / 10} ساعة`;
        } else {
            const days = Math.floor(hours / 24);
            const remainingHours = Math.round((hours % 24) * 10) / 10;
            if (remainingHours === 0) {
                return `${days} يوم`;
            }
            return `${days} يوم و ${remainingHours} ساعة`;
        }
    };

    // ✅ CORRECTION : Déplacer findCurrentUserId dans le composant principal
    const findCurrentUserId = () => {
        if (currentUser?._id) return currentUser._id;
        
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (user?._id) return user._id;
            }
        } catch (error) {
            console.log('❌ Erreur lecture localStorage');
        }
        
        return null;
    };

    // Vérifier si l'activité concerne l'utilisateur (publiée par lui ou il est identifié)
    const isActivityRelatedToUser = (activity, currentUserId) => {
        if (!activity || !currentUserId) return false;

        // Vérifier si l'utilisateur a publié l'activité
        let activityUserId = activity.user;
        if (typeof activityUserId === 'object' && activityUserId !== null) {
            activityUserId = activityUserId._id || activityUserId.id;
        }
        
        const isPublisher = activityUserId && activityUserId.toString() === currentUserId.toString();
        
        // Vérifier si l'utilisateur est identifié dans l'activité
        const isIdentified = activity.identified_users && activity.identified_users.some(user => {
            let identifiedUserId = user;
            if (typeof identifiedUserId === 'object' && identifiedUserId !== null) {
                identifiedUserId = identifiedUserId._id || identifiedUserId.id;
            }
            return identifiedUserId && identifiedUserId.toString() === currentUserId.toString();
        });

        return isPublisher || isIdentified;
    };

    // Calculer les statistiques pour l'utilisateur courant
    useEffect(() => {
        const currentUserId = findCurrentUserId();
        if (!currentUserId) return;

        // Filtrer les activités liées à l'utilisateur
        const userRelatedActivities = activities.filter(activity => 
            isActivityRelatedToUser(activity, currentUserId)
        );

        // Calculer les heures
        let totalHours = 0;
        userRelatedActivities.forEach(activity => {
            if (activity.start_date && activity.end_date && activity.start_time && activity.end_time) {
                const hours = calculateHoursBetweenDates(
                    activity.start_date,
                    activity.end_date,
                    activity.start_time,
                    activity.end_time
                );
                totalHours += hours;
            }
        });

        const activityCount = userRelatedActivities.length;
        const identifiedActivities = userRelatedActivities.filter(activity => {
            let activityUserId = activity.user;
            if (typeof activityUserId === 'object') {
                activityUserId = activityUserId._id;
            }
            return activityUserId.toString() !== currentUserId.toString();
        }).length;

        const totalDays = activityCount > 0 ? Math.ceil(totalHours / 8) : 0;
        const averageHoursPerActivity = activityCount > 0 ? totalHours / activityCount : 0;

        // Calcul des heures par période
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const weeklyHours = userRelatedActivities
            .filter(activity => {
                if (!activity.start_date) return false;
                const activityDate = new Date(activity.start_date);
                return activityDate >= oneWeekAgo;
            })
            .reduce((sum, activity) => {
                const hours = calculateHoursBetweenDates(
                    activity.start_date,
                    activity.end_date,
                    activity.start_time,
                    activity.end_time
                );
                return sum + hours;
            }, 0);

        const monthlyHours = userRelatedActivities
            .filter(activity => {
                if (!activity.start_date) return false;
                const activityDate = new Date(activity.start_date);
                return activityDate >= oneMonthAgo;
            })
            .reduce((sum, activity) => {
                const hours = calculateHoursBetweenDates(
                    activity.start_date,
                    activity.end_date,
                    activity.start_time,
                    activity.end_time
                );
                return sum + hours;
            }, 0);

        setStats({
            totalHours,
            totalDays,
            activityCount,
            averageHoursPerDay: averageHoursPerActivity,
            weeklyHours,
            monthlyHours,
            identifiedActivities
        });

    }, [activities, currentUser]); // ✅ CORRECTION : Dépendances correctes

    // Charger les statistiques admin si l'utilisateur est admin
    useEffect(() => {
        const loadAdminStats = async () => {
            if (currentUser?.role === 'admin') {
                try {
                    const response = await axios.get(
                        `/api/activity/admin/stats?timeRange=${timeRange}`,
                        getConfig()
                    );
                    setAdminStats(response.data.stats);
                } catch (error) {
                    console.error('Erreur chargement stats admin:', error);
                }
            }
        };

        loadAdminStats();
    }, [currentUser, timeRange]);

    const progressPercentage = Math.min((stats.weeklyHours / 40) * 100, 100);

    const getProgressVariant = (percentage) => {
        if (percentage < 50) return 'danger';
        if (percentage < 80) return 'warning';
        return 'success';
    };

    return (
        <Card className="general-stats">
            <Card.Header className="stats-header">
                <div className="header-content">
                    <h5 className="title">📊 إحصائيات عامة</h5>
                    <Badge bg="info" className="stats-badge">
                        {stats.activityCount} نشاط
                    </Badge>
                </div>
                {currentUser?.role === 'admin' && (
                    <Form.Select 
                        size="sm" 
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="time-range-selector"
                    >
                        <option value="all">كل الفترات</option>
                        <option value="week">أسبوع</option>
                        <option value="month">شهر</option>
                        <option value="year">سنة</option>
                    </Form.Select>
                )}
            </Card.Header>

            <Card.Body className="stats-body">
                {/* Barre de progression */}
                <div className="progress-section">
                    <div className="progress-header">
                        <span className="progress-label">التقدم الأسبوعي</span>
                        <span className="progress-value">
                            {Math.round(stats.weeklyHours)} / 40 ساعة
                        </span>
                    </div>
                    <ProgressBar 
                        now={progressPercentage}
                        variant={getProgressVariant(progressPercentage)}
                        className="stats-progress-bar"
                    />
                    <div className="progress-percentage">
                        {Math.round(progressPercentage)}% من الهدف الأسبوعي
                    </div>
                </div>

                {/* Statistiques rapides */}
                <Row className="quick-stats">
                    <Col md={6} className="mb-2">
                        <div className="quick-stat-item">
                            <div className="stat-icon">🕐</div>
                            <div className="stat-content">
                                <div className="stat-value">{formatHours(stats.totalHours)}</div>
                                <div className="stat-label">إجمالي الساعات</div>
                            </div>
                        </div>
                    </Col>
                    <Col md={6} className="mb-2">
                        <div className="quick-stat-item">
                            <div className="stat-icon">📋</div>
                            <div className="stat-content">
                                <div className="stat-value">{stats.activityCount}</div>
                                <div className="stat-label">إجمالي الأنشطة</div>
                            </div>
                        </div>
                    </Col>
                    <Col md={6} className="mb-2">
                        <div className="quick-stat-item">
                            <div className="stat-icon">👥</div>
                            <div className="stat-content">
                                <div className="stat-value">{stats.identifiedActivities}</div>
                                <div className="stat-label">أنشطة تم تحديدك فيها</div>
                            </div>
                        </div>
                    </Col>
                    <Col md={6} className="mb-2">
                        <div className="quick-stat-item">
                            <div className="stat-icon">⚡</div>
                            <div className="stat-content">
                                <div className="stat-value">
                                    {Math.round(stats.averageHoursPerDay * 10) / 10} ساعة
                                </div>
                                <div className="stat-label">المعدل لكل نشاط</div>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Bouton détails */}
                <div className="details-toggle text-center">
                    <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => setShowDetails(!showDetails)}
                        className="toggle-details-btn"
                    >
                        {showDetails ? '📋 إخفاء التفاصيل' : '📋 عرض التفاصيل المتقدمة'}
                    </Button>
                </div>

                {/* Détails avancés */}
                <Collapse in={showDetails}>
                    <div className="advanced-stats">
                        {/* Statistiques admin */}
                        {currentUser?.role === 'admin' && adminStats && (
                            <div className="admin-stats-section">
                                <h6 className="section-title">👑 إحصائيات المدير</h6>
                                <Row>
                                    <Col md={6}>
                                        <div className="admin-stat">
                                            <span className="admin-stat-label">إجمالي الأنشطة:</span>
                                            <span className="admin-stat-value">
                                                {adminStats.generalStats.totalActivities}
                                            </span>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="admin-stat">
                                            <span className="admin-stat-label">عدد المستخدمين:</span>
                                            <span className="admin-stat-value">
                                                {adminStats.generalStats.totalUsers}
                                            </span>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="admin-stat">
                                            <span className="admin-stat-label">إجمالي الإعجابات:</span>
                                            <span className="admin-stat-value">
                                                {adminStats.generalStats.totalLikes}
                                            </span>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="admin-stat">
                                            <span className="admin-stat-label">إجمالي التعليقات:</span>
                                            <span className="admin-stat-value">
                                                {adminStats.generalStats.totalComments}
                                            </span>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Top utilisateurs */}
                                {adminStats.topUsers && adminStats.topUsers.length > 0 && (
                                    <div className="top-users-section mt-3">
                                        <h6 className="section-title">🏆 أكثر المستخدمين نشاطاً</h6>
                                        <div className="top-users-list">
                                            {adminStats.topUsers.map((userStat, index) => (
                                                <div key={userStat._id} className="top-user-item">
                                                    <div className="user-rank">{index + 1}</div>
                                                    <div className="user-info">
                                                        <div className="user-name">
                                                            {userStat.user?.name || 'مستخدم غير معروف'}
                                                        </div>
                                                        <div className="user-stats">
                                                            <span>{userStat.activityCount} نشاط</span>
                                                            <span>{userStat.totalDuration} ساعة</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Statistiques détaillées pour tous les utilisateurs */}
                        <div className="detailed-stats-section">
                            <h6 className="section-title">📈 تحليل مفصل</h6>
                            <Row>
                                <Col md={6}>
                                    <div className="detailed-stat">
                                        <span className="stat-label">ساعات هذا الأسبوع:</span>
                                        <span className="stat-value">{formatHours(stats.weeklyHours)}</span>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="detailed-stat">
                                        <span className="stat-label">ساعات هذا الشهر:</span>
                                        <span className="stat-value">{formatHours(stats.monthlyHours)}</span>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="detailed-stat">
                                        <span className="stat-label">أيام العمل:</span>
                                        <span className="stat-value">{stats.totalDays} يوم</span>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="detailed-stat">
                                        <span className="stat-label">معدل الإنتاجية:</span>
                                        <span className="stat-value">{Math.round(progressPercentage)}%</span>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Collapse>
            </Card.Body>

            <Card.Footer className="stats-footer">
                <div className="footer-content">
                    <span className="last-update">آخر تحديث: الآن</span>
                    <span className="scope-info">
                        {currentUser?.role === 'admin' ? 'جميع المستخدمين' : 'أنشطتك فقط'}
                    </span>
                </div>
            </Card.Footer>
        </Card>
    );
};

export default GeneralStats;