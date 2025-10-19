
// components/WorkHoursCounter/WorkHoursCounter.js
import React, { useState, useEffect } from 'react'
import { Card, ProgressBar, Badge, Button, Collapse } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import './WorkHoursCounter.css'

const WorkHoursCounter = () => {
    const activities = useSelector(state => state.activityReducer.activities || [])
    
    // Récupération de l'utilisateur connecté
    const currentUser = useSelector(state => {
        return state.authReducer?.user || 
               state.authReducer?.currentUser ||
               state.authReducer?.authData?.user
    }) || JSON.parse(localStorage.getItem('user')) || 
       JSON.parse(localStorage.getItem('currentUser'))

    const [workHours, setWorkHours] = useState({
        totalHours: 0,
        totalDays: 0,
        activityCount: 0,
        averageHoursPerDay: 0,
        weeklyHours: 0,
        monthlyHours: 0
    })

    const [showDetails, setShowDetails] = useState(false)

    // ✅ CORRECTION : Fonction pour vérifier si l'utilisateur est admin
    const isUserAdmin = () => {
        const user = currentUser || JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('currentUser'));
        return user?.role === 'admin' || user?.isAdmin === true;
    };

    // Fonction pour calculer les heures
    const calculateHoursBetweenDates = (startDate, endDate, startTime, endTime) => {
        if (!startDate || !endDate || !startTime || !endTime) return 0

        try {
            const start = new Date(startDate)
            const [startHours, startMinutes] = startTime.split(':').map(Number)
            start.setHours(startHours, startMinutes, 0, 0)

            const end = new Date(endDate)
            const [endHours, endMinutes] = endTime.split(':').map(Number)
            end.setHours(endHours, endMinutes, 0, 0)

            const diffMs = end - start
            if (diffMs <= 0) return 0

            const diffHours = diffMs / (1000 * 60 * 60)
            return Math.round(diffHours * 10) / 10
        } catch (error) {
            console.error('❌ Erreur calcul durée:', error)
            return 0
        }
    }

    // Fonction pour formater les heures
    const formatHours = (hours) => {
        if (hours === 0) return '0 ساعة'
        if (hours < 1) {
            const minutes = Math.round(hours * 60)
            return `${minutes} دقيقة`
        } else if (hours === 1) {
            return 'ساعة واحدة'
        } else if (hours < 24) {
            return `${Math.round(hours * 10) / 10} ساعة`
        } else {
            const days = Math.floor(hours / 24)
            const remainingHours = Math.round((hours % 24) * 10) / 10
            if (remainingHours === 0) {
                return `${days} يوم`
            }
            return `${days} يوم و ${remainingHours} ساعة`
        }
    }

    // Fonction DEBUG pour analyser la structure de l'utilisateur
    const debugUserStructure = () => {
        console.log('🔍 STRUCTURE UTILISATEUR CONNECTÉ:')
        console.log('currentUser:', currentUser)
        console.log('currentUser._id:', currentUser?._id)
        console.log('currentUser.id:', currentUser?.id)
        console.log('currentUser.userId:', currentUser?.userId)
        console.log('currentUser.role:', currentUser?.role) // ✅ Ajout du rôle
        console.log('currentUser.isAdmin:', currentUser?.isAdmin) // ✅ Ajout isAdmin
        console.log('currentUser.activities:', currentUser?.activities)
        
        if (currentUser?.activities && currentUser.activities.length > 0) {
            console.log('Première activité user ID:', currentUser.activities[0]?.user?._id)
            console.log('ATTENTION: Ceci est l\'ID du créateur de l\'activité, pas nécessairement l\'utilisateur connecté!')
        }
        
        console.log('Tous les champs de currentUser:', currentUser ? Object.keys(currentUser) : 'Aucun utilisateur')
        console.log('🔍 FIN DEBUG STRUCTURE')
    }

    // Fonction pour trouver l'ID utilisateur CORRECT
    const findCurrentUserId = () => {
        console.log('🔍 Recherche ID utilisateur CONNECTÉ...')
        
        // DEBUG: Afficher la structure complète
        debugUserStructure()

        // Méthode 1: Chercher dans currentUser direct (le plus probable)
        if (currentUser?._id) {
            console.log('✅ ID utilisateur CONNECTÉ trouvé dans currentUser._id:', currentUser._id)
            return currentUser._id
        }
        if (currentUser?.id) {
            console.log('✅ ID utilisateur CONNECTÉ trouvé dans currentUser.id:', currentUser.id)
            return currentUser.id
        }
        if (currentUser?.userId) {
            console.log('✅ ID utilisateur CONNECTÉ trouvé dans currentUser.userId:', currentUser.userId)
            return currentUser.userId
        }

        // Méthode 2: Chercher dans le token JWT du localStorage
        const token = localStorage.getItem('token') || localStorage.getItem('jwtToken')
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                if (payload.id) {
                    console.log('✅ ID utilisateur CONNECTÉ trouvé dans le token JWT:', payload.id)
                    return payload.id
                }
            } catch (error) {
                console.log('❌ Erreur décodage token JWT')
            }
        }

        // Méthode 3: Chercher dans localStorage user
        const localStorageUser = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('currentUser'))
        if (localStorageUser?._id) {
            console.log('✅ ID utilisateur CONNECTÉ trouvé dans localStorage user._id:', localStorageUser._id)
            return localStorageUser._id
        }
        if (localStorageUser?.id) {
            console.log('✅ ID utilisateur CONNECTÉ trouvé dans localStorage user.id:', localStorageUser.id)
            return localStorageUser.id
        }

        console.log('❌ Aucun ID utilisateur CONNECTÉ trouvé')
        return null
    }

    // ✅ CORRECTION : Fonction pour vérifier si l'activité appartient à l'utilisateur OU si admin
    const isActivityPublishedByUser = (activity, currentUserId) => {
        if (!activity || !currentUserId) {
            return false
        }

        // ✅ CORRECTION CRITIQUE : SI ADMIN, VOIR TOUTES LES ACTIVITÉS
        if (isUserAdmin()) {
            console.log(`👑 ADMIN - Accès à l'activité ${activity._id} de ${activity.user?.name || 'utilisateur inconnu'}`)
            return true;
        }

        // Vérifier le champ user de l'activité (logique normale pour les utilisateurs non-admin)
        if (activity.user) {
            let activityUserId = activity.user
            
            // Si c'est un objet, extraire l'ID
            if (typeof activityUserId === 'object' && activityUserId !== null) {
                activityUserId = activityUserId._id || activityUserId.id || activityUserId.userId
            }
            
            if (activityUserId && activityUserId.toString() === currentUserId.toString()) {
                console.log(`✅ Activité ${activity._id} appartient à l'utilisateur connecté`)
                return true
            } else {
                console.log(`❌ Activité ${activity._id} - ID activité: ${activityUserId} vs ID utilisateur: ${currentUserId}`)
            }
        }

        return false
    }

    // ✅ CORRECTION : Calcul des statistiques avec support admin
    useEffect(() => {
        console.log('🔄 CALCUL STATISTIQUES PERSONNELLES')
        console.log('📊 Total activités disponibles:', activities.length)

        // ✅ VÉRIFICATION STATUT ADMIN
        const isAdmin = isUserAdmin();
        console.log('👑 STATUT ADMIN:', isAdmin);
        
        if (isAdmin) {
            console.log('🎯 MODE ADMIN ACTIVÉ - Calcul des statistiques pour TOUTES les activités');
        }

        // Trouver l'ID utilisateur CONNECTÉ
        const currentUserId = findCurrentUserId()
        
        if (!currentUserId && !isAdmin) {
            console.log('❌ Impossible de trouver l\'ID utilisateur CONNECTÉ pour le filtrage')
            setWorkHours({
                totalHours: 0,
                totalDays: 0,
                activityCount: 0,
                averageHoursPerDay: 0,
                weeklyHours: 0,
                monthlyHours: 0
            })
            return
        }

        console.log('🎯 ID utilisateur CONNECTÉ pour filtrage:', currentUserId)
        console.log('🔍 Début du filtrage des activités...')

        // ✅ CORRECTION : Filtrer les activités selon le statut admin
        let filteredActivities = [];
        
        if (isAdmin) {
            // ✅ ADMIN : Prendre TOUTES les activités
            filteredActivities = [...activities];
            console.log('👑 MODE ADMIN - Utilisation de TOUTES les activités:', filteredActivities.length);
        } else {
            // ✅ UTILISATEUR NORMAL : Filtrer seulement ses activités
            filteredActivities = activities.filter(activity => {
                return isActivityPublishedByUser(activity, currentUserId)
            });
            console.log('👤 MODE UTILISATEUR - Activités filtrées:', filteredActivities.length);
        }

        console.log('📋 Activités sélectionnées pour calcul:', filteredActivities.length)
        console.log('📝 Détail des activités:', 
            filteredActivities.map(a => ({ 
                id: a._id, 
                title: a.activity_subject || 'Sans titre',
                créateur: a.user?.name || 'Inconnu',
                activityUserId: a.user?._id || a.user?.id || a.user
            }))
        )

        // Calculer les heures
        let totalHours = 0
        filteredActivities.forEach((activity, index) => {
            if (activity && activity.start_date && activity.end_date && activity.start_time && activity.end_time) {
                const hours = calculateHoursBetweenDates(
                    activity.start_date,
                    activity.end_date,
                    activity.start_time,
                    activity.end_time
                )
                totalHours += hours
                console.log(`⏱️ Activité ${index + 1}: "${activity.activity_subject || 'Sans titre'}" - ${hours} heures`)
            }
        })

        const activityCount = filteredActivities.length
        const totalDays = activityCount > 0 ? Math.ceil(totalHours / 8) : 0
        const averageHoursPerActivity = activityCount > 0 ? totalHours / activityCount : 0

        // Calculer les heures de cette semaine
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        
        const weeklyHours = filteredActivities
            .filter(activity => {
                if (!activity || !activity.start_date) return false
                try {
                    const activityDate = new Date(activity.start_date)
                    return activityDate >= oneWeekAgo
                } catch (error) {
                    return false
                }
            })
            .reduce((sum, activity) => {
                const hours = calculateHoursBetweenDates(
                    activity.start_date,
                    activity.end_date,
                    activity.start_time,
                    activity.end_time
                )
                return sum + hours
            }, 0)

        // Calculer les heures de ce mois
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        
        const monthlyHours = filteredActivities
            .filter(activity => {
                if (!activity || !activity.start_date) return false
                try {
                    const activityDate = new Date(activity.start_date)
                    return activityDate >= oneMonthAgo
                } catch (error) {
                    return false
                }
            })
            .reduce((sum, activity) => {
                const hours = calculateHoursBetweenDates(
                    activity.start_date,
                    activity.end_date,
                    activity.start_time,
                    activity.end_time
                )
                return sum + hours
            }, 0)

        console.log('📈 STATISTIQUES FINALES:', {
            totalHeures: totalHours,
            heuresSemaine: weeklyHours,
            heuresMois: monthlyHours,
            activitesFiltrees: activityCount,
            activitesTotales: activities.length,
            idUtilisateur: currentUserId,
            estAdmin: isAdmin
        })

        setWorkHours({
            totalHours,
            totalDays,
            activityCount,
            averageHoursPerDay: averageHoursPerActivity,
            weeklyHours,
            monthlyHours
        })

    }, [activities, currentUser])

    const progressPercentage = Math.min((workHours.weeklyHours / 40) * 100, 100)

    // ✅ CORRECTION : Texte dynamique selon le statut admin
    const isAdmin = isUserAdmin();
    const titleText = isAdmin ? "⏱️ إحصائيات ساعات العمل الشاملة (المسؤول)" : "⏱️ إحصائيات ساعات العمل الشخصية";
    const badgeText = isAdmin ? 
        `${workHours.activityCount} نشاط شامل` : 
        `${workHours.activityCount} نشاط خاص`;

    return (
        <Card className="work-hours-counter">
            <Card.Header className="work-hours-header">
                <div className="header-content">
                    <h5 className="title">{titleText}</h5>
                    <Badge bg={isAdmin ? "success" : "primary"} className="activity-badge">
                        {badgeText}
                        {isAdmin && <span className="ms-1">👑</span>}
                    </Badge>
                </div>
            </Card.Header>

            <Card.Body className="work-hours-body">
                <div className="scrollable-content">
                    {/* Barre de progression */}
                    <div className="progress-section">
                        <div className="progress-header">
                            <span className="progress-label">التقدم الأسبوعي</span>
                            <span className="progress-value">
                                {Math.round(workHours.weeklyHours)} / 40 ساعة
                            </span>
                        </div>
                        <ProgressBar 
                            now={progressPercentage}
                            variant={getProgressVariant(progressPercentage)}
                            className="work-progress-bar"
                        />
                        <div className="progress-percentage">
                            {Math.round(progressPercentage)}% من الهدف الأسبوعي
                        </div>
                    </div>

                    {/* Statistiques principales */}
                    <div className="main-stats-section">
                        <h6 className="main-stats-title">
                            {isAdmin ? "📊 الإحصائيات الشاملة" : "📊 إحصائياتك الرئيسية"}
                        </h6>
                        <div className="main-stats-grid">
                            <div className="main-stat-item total-hours">
                                <div className="main-stat-info">
                                    <div className="main-stat-icon">🕐</div>
                                    <div className="main-stat-content">
                                        <div className="main-stat-label">
                                            {isAdmin ? "إجمالي ساعات العمل الشاملة" : "إجمالي ساعات العمل"}
                                        </div>
                                        <div className="main-stat-value">{formatHours(workHours.totalHours)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="main-stat-item weekly-hours">
                                <div className="main-stat-info">
                                    <div className="main-stat-icon">📅</div>
                                    <div className="main-stat-content">
                                        <div className="main-stat-label">
                                            {isAdmin ? "ساعات هذا الأسبوع الشاملة" : "ساعات هذا الأسبوع"}
                                        </div>
                                        <div className="main-stat-value">{formatHours(workHours.weeklyHours)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="main-stat-item monthly-hours">
                                <div className="main-stat-info">
                                    <div className="main-stat-icon">📊</div>
                                    <div className="main-stat-content">
                                        <div className="main-stat-label">
                                            {isAdmin ? "ساعات هذا الشهر الشاملة" : "ساعات هذا الشهر"}
                                        </div>
                                        <div className="main-stat-value">{formatHours(workHours.monthlyHours)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="main-stat-item average-hours">
                                <div className="main-stat-info">
                                    <div className="main-stat-icon">⚡</div>
                                    <div className="main-stat-content">
                                        <div className="main-stat-label">
                                            {isAdmin ? "المعدل لكل نشاط" : "المعدل لكل نشاط"}
                                        </div>
                                        <div className="main-stat-value">
                                            {Math.round(workHours.averageHoursPerDay * 10) / 10} ساعة
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ✅ CORRECTION : Information sur le filtrage avec support admin */}
                    {activities.length > 0 && workHours.activityCount === 0 && !isAdmin && (
                        <div className="alert alert-warning mt-2">
                            <small>
                                ⚠️ {activities.length} activité(s) affichée(s) sur le mur, 
                                mais aucune n'a été reconnue comme étant publiée par vous.
                                <br />
                                <strong>Vérifiez la console pour les détails.</strong>
                            </small>
                        </div>
                    )}

                    {isAdmin && workHours.activityCount > 0 && (
                        <div className="alert alert-info mt-2">
                            <small>
                                👑 <strong>وضع المسؤول:</strong> عرض جميع الأنشطة من جميع المستخدمين
                                <br />
                                📊 {workHours.activityCount} activité(s) au total sur le système
                            </small>
                        </div>
                    )}

                    {workHours.activityCount > 0 && !isAdmin && (
                        <div className="alert alert-success mt-2">
                            <small>
                                ✅ {workHours.activityCount} activité(s) publiée(s) par vous sur {activities.length} au total
                            </small>
                        </div>
                    )}

                    <div className="details-toggle text-center">
                        <Button 
                            variant="warning" 
                            size="sm"
                            onClick={() => setShowDetails(!showDetails)}
                            className="toggle-details-btn"
                            aria-expanded={showDetails}
                        >
                            {showDetails ? '📋 إخفاء التفاصيل الإضافية' : '📋 تفاصيل إضافية'}
                        </Button>
                    </div>

                    {/* Détails supplémentaires */}
                    <Collapse in={showDetails}>
                        <div>
                            <div className="details-content">
                                <div className="additional-details-section">
                                    <h6 className="details-section-title">
                                        {isAdmin ? "📈 تحليل الأداء الشامل" : "📈 تحليل أدائك"}
                                    </h6>
                                    <div className="details-list">
                                        <div className="detail-item-column">
                                            <div className="detail-question">
                                                {isAdmin ? "أيام العمل الإجمالية الشاملة" : "أيام العمل الإجمالية"}
                                            </div>
                                            <div className="detail-answer">{workHours.totalDays} يوم</div>
                                        </div>
                                        <div className="detail-item-column">
                                            <div className="detail-question">متوسط الساعات للنشاط</div>
                                            <div className="detail-answer">
                                                {Math.round(workHours.averageHoursPerDay * 10) / 10} ساعة
                                            </div>
                                        </div>
                                        <div className="detail-item-column">
                                            <div className="detail-question">
                                                {isAdmin ? "إجمالي الأنشطة في النظام" : "إجمالي الأنشطة المنشورة"}
                                            </div>
                                            <div className="detail-answer">{workHours.activityCount} نشاط</div>
                                        </div>
                                        <div className="detail-item-column">
                                            <div className="detail-question">
                                                {isAdmin ? "معدل الإنتاجية الأسبوعي الشامل" : "معدل الإنتاجية الأسبوعي"}
                                            </div>
                                            <div className="detail-answer">{Math.round(progressPercentage)}%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Collapse>
                </div>
            </Card.Body>

            <Card.Footer className="work-hours-footer">
                <div className="footer-content">
                    <span className="last-update">آخر تحديث: الآن</span>
                    <span className="target-info">
                        {isAdmin ? "المعيار: 40 ساعة أسبوعياً للمستخدم" : "الهدف: 40 ساعة أسبوعياً"}
                    </span>
                </div>
            </Card.Footer>
        </Card>
    )
}

const getProgressVariant = (percentage) => {
    if (percentage < 50) return 'danger'
    if (percentage < 80) return 'warning'
    return 'success'
}

export default WorkHoursCounter