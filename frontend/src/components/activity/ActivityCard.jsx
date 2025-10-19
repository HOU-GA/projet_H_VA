
// components/activity/ActivityCard.jsx

import React, { useState, useEffect } from 'react'
import { Card, Button, Form, Spinner, Collapse, Modal, Badge } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { 
    likeActivity, 
    addComment, 
    deleteActivity,
    replyToComment,
    likeComment,
    getFilteredActivities
} from '../../JS/actions/ActivityAction'
import { getUnviewedActivitiesCount } from '../../JS/actions/NotificationActivityAction'
import axios from 'axios'
import './ActivityCard.css'

const ActivityCard = ({ 
    activity, 
    onEdit,
    isAdminView = false,
    onDelete,
    showAdminControls = false 
}) => {
    const dispatch = useDispatch()
    const auth = useSelector(state => state.authReducer)
    
    const currentUser = auth.user

    // ✅ États comme dans l'ancien code
    const [hasLiked, setHasLiked] = useState(activity.userHasLiked || false)
    const [showComments, setShowComments] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [commentText, setCommentText] = useState('')
    const [isCommenting, setIsCommenting] = useState(false)
    const [isLiking, setIsLiking] = useState(false)
    const [showAuthorizedUsers, setShowAuthorizedUsers] = useState(false)

    // ✅ CORRECTION : État pour les activités nouvelles
    const [isNewActivity, setIsNewActivity] = useState(false)
    const [isCheckingStatus, setIsCheckingStatus] = useState(false)

    // ✅ États pour les réponses aux commentaires
    const [replyingTo, setReplyingTo] = useState(null)
    const [replyText, setReplyText] = useState('')
    const [isReplying, setIsReplying] = useState(false)
    const [expandedReplies, setExpandedReplies] = useState({})

    // ✅ CORRECTION: Récupération robuste de l'ID utilisateur
    const getCurrentUserId = () => {
        let userId = 
            currentUser?._id || 
            currentUser?.id || 
            currentUser?.user?._id ||
            currentUser?.user?.id ||
            (currentUser?.user && typeof currentUser.user === 'string' ? currentUser.user : null);
        
        if (!userId) {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    userId = payload.id || payload._id || payload.userId;
                }
            } catch (error) {
                console.error('❌ Erreur décodage JWT:', error);
            }
        }

        if (!userId) {
            userId = auth.userId || auth._id;
        }

        return userId;
    };

    const currentUserId = getCurrentUserId();

    useEffect(() => {
        setHasLiked(activity.userHasLiked || false)
    }, [activity.userHasLiked])

    // ✅ SOLUTION ULTIME : Vérification robuste des nouvelles activités
    useEffect(() => {
        const checkIfActivityIsNewForUser = async () => {
            if (!currentUserId || !activity._id) {
                console.log('❌ Données manquantes pour vérification');
                setIsNewActivity(false);
                return;
            }
            
            // ✅ NE PAS AFFICHER POUR LE CRÉATEUR
            const activityCreatorId = activity.user?._id || activity.user;
            if (currentUserId.toString() === activityCreatorId?.toString()) {
                console.log('👤 Utilisateur est le créateur - pas de badge');
                setIsNewActivity(false);
                return;
            }

            setIsCheckingStatus(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsNewActivity(false);
                    return;
                }

                const config = {
                    headers: { authorization: token }
                };

                console.log(`🔍 Vérification activité ${activity._id} pour utilisateur ${currentUserId}`);
                
                // ✅ MÉTHODE PRINCIPALE : Vérifier avec activity-view
                try {
                    const response = await axios.get(
                        `/api/activity-view/${activity._id}/view-status`,
                        config
                    );
                    
                    console.log('📊 Réponse view-status:', response.data);
                    
                    if (response.data.success !== undefined) {
                        setIsNewActivity(response.data.isNewActivity);
                        console.log(`🎯 Statut activité: ${response.data.isNewActivity ? 'NOUVELLE 🆕' : 'DÉJÀ VUE 👀'}`);
                    } else {
                        throw new Error('Réponse API invalide');
                    }
                    
                } catch (apiError) {
                    console.log('🔄 API activity-view échouée, utilisation méthode fallback');
                    
                    // ✅ FALLBACK : Vérifier avec notification-activity + date
                    try {
                        // Vérifier le compteur global
                        const notifResponse = await axios.get(
                            `/api/notification-activity/unviewed-count`,
                            config
                        );
                        
                        const hasUnviewed = notifResponse.data.unviewedCount > 0;
                        console.log(`🔄 Fallback - Activités non vues: ${notifResponse.data.unviewedCount}`);
                        
                        // Vérifier la date (activités récentes < 24h)
                        const activityDate = new Date(activity.createdAt);
                        const now = new Date();
                        const hoursDiff = (now - activityDate) / (1000 * 60 * 60);
                        const isRecent = hoursDiff < 24;
                        
                        console.log(`🔄 Fallback - Activité récente (<24h): ${isRecent}, ${hoursDiff.toFixed(1)}h`);
                        
                        // Vérifier dans localStorage
                        const viewedActivities = JSON.parse(localStorage.getItem('viewedActivities') || '{}');
                        const wasViewed = viewedActivities[activity._id];
                        
                        console.log(`🔄 Fallback - Déjà vue dans localStorage: ${wasViewed}`);
                        
                        // Logique combinée
                        const shouldBeNew = hasUnviewed && isRecent && !wasViewed;
                        setIsNewActivity(shouldBeNew);
                        
                        console.log(`🔄 Fallback - Décision finale: ${shouldBeNew ? 'NOUVELLE 🆕' : 'DÉJÀ VUE 👀'}`);
                        
                    } catch (fallbackError) {
                        console.error('❌ Toutes les méthodes ont échoué:', fallbackError);
                        setIsNewActivity(false);
                    }
                }
                
            } catch (error) {
                console.error('❌ Erreur générale vérification:', error);
                setIsNewActivity(false);
            } finally {
                setIsCheckingStatus(false);
            }
        };

        checkIfActivityIsNewForUser();
    }, [activity._id, activity.user, activity.createdAt, currentUserId]);

    // ✅ FONCTION ROBUSTE pour marquer l'activité comme consultée
    const markActivityAsViewed = async () => {
        if (!currentUserId || !activity._id) return;

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { authorization: token }
            };

            console.log('🎯 Marquage activité comme vue:', activity._id);

            // ✅ MÉTHODE PRINCIPALE : Utiliser la route dédiée
            try {
                const response = await axios.post(
                    `/api/activity-view/${activity._id}/mark-viewed`,
                    {},
                    config
                );
                console.log('✅ Activité marquée via route dédiée:', response.data);
            } catch (routeError) {
                console.log('🔄 Fallback marquage activité');
                
                // ✅ FALLBACK : Stocker dans localStorage
                const viewedActivities = JSON.parse(localStorage.getItem('viewedActivities') || '{}');
                viewedActivities[activity._id] = {
                    viewedAt: new Date().toISOString(),
                    userId: currentUserId,
                    activityId: activity._id
                };
                localStorage.setItem('viewedActivities', JSON.stringify(viewedActivities));
                console.log('✅ Activité marquée dans localStorage');
            }

            // ✅ Mettre à jour l'état local IMMÉDIATEMENT
            setIsNewActivity(false);
            
            // ✅ Mettre à jour le compteur global
            try {
                await dispatch(getUnviewedActivitiesCount());
            } catch (countError) {
                console.error('❌ Erreur mise à jour compteur:', countError);
            }
            
            console.log('✅ Activité marquée comme consultée avec succès');

        } catch (error) {
            console.error('❌ Erreur marquage activité consultée:', error);
        }
    };

    // ✅ Gestion du clic sur la carte
    const handleCardClick = () => {
        if (isNewActivity) {
            console.log('🖱️ Clic sur nouvelle activité - marquage comme vue');
            markActivityAsViewed();
        }
    };

    // ✅ CORRECTION: Récupération de l'ID de l'activité
    const getActivityUserId = () => {
        return activity.user?._id || activity.user;
    };

    const activityUserId = getActivityUserId();

    // ✅ CORRECTION CRITIQUE : Permissions clarifiées
    const isOwner = currentUserId && currentUserId.toString() === activityUserId.toString();
    const isAdmin = currentUser?.role === 'admin' || auth.role === 'admin';

    // ✅ CORRECTION : Ne pas afficher l'indicateur pour le créateur
    const shouldShowNewIndicator = isNewActivity && !isOwner;

    // ✅ DROITS DE MODIFICATION/SUPPRESSION
    const canEdit = isAdminView ? true : (isOwner || isAdmin);
    const canDelete = isAdminView ? true : isAdmin;

    // ✅ FONCTION POUR CALCULER userHasLiked SI MANQUANT
    const calculateUserHasLiked = (comment) => {
        if (comment.userHasLiked !== undefined) {
            return comment.userHasLiked;
        }
        
        if (comment.likes && currentUserId) {
            return comment.likes.some(like => 
                like.user?._id === currentUserId || 
                like.user === currentUserId ||
                like.userId === currentUserId
            );
        }
        
        return false;
    };

    // ✅ CORRECTION : Fonction de suppression
    const handleDelete = async () => {
        if (!canDelete) {
            alert('❌ Seul un administrateur peut supprimer les publications');
            return;
        }

        if (window.confirm('هل أنت متأكد من حذف هذا النشاط؟')) {
            try {
                console.log('🗑️ Suppression de l\'activité:', activity._id);
                await dispatch(deleteActivity(activity._id));
                
                if (onDelete && typeof onDelete === 'function') {
                    onDelete(activity._id);
                } else {
                    setTimeout(() => {
                        dispatch(getFilteredActivities(1, 20, { viewMode: 'all' }));
                    }, 1000);
                }
            } catch (error) {
                console.error('❌ Erreur lors de la suppression:', error);
                alert('Erreur lors de la suppression de l\'activité');
            }
        }
    };

    // ✅ FONCTION POUR GÉRER LA MODIFICATION
    const handleEdit = () => {
        console.log('✏️ Bouton modifier cliqué!');
        console.log('📝 Activité à modifier:', activity);
        
        if (onEdit && typeof onEdit === 'function') {
            console.log('✅ Appel de onEdit avec activité');
            onEdit(activity);
        } else {
            console.error('❌ onEdit non disponible');
            alert(`🔄 Fonction modification non disponible\n\n📝 ${activity.activity_subject}`);
        }
    };

    // ✅ BOUTON MODIFIER
    const EditButton = () => {
        if (!canEdit) return null;

        return (
            <button 
                className="footer-btn edit" 
                onClick={handleEdit}
                title={isAdmin ? "تعديل النشاط (مسؤول)" : "تعديل النشاط"}
                style={{
                    backgroundColor: isAdmin ? '#17a2b8' : '#ffc107',
                    color: isAdmin ? '#fff' : '#000',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}
            >
                <span>✏️</span>
                <span>{isAdmin ? 'تعديل (مسؤول)' : 'تعديل'}</span>
            </button>
        );
    };

    // ✅ BOUTON SUPPRIMER
    const DeleteButton = () => {
        if (!canDelete) return null;

        return (
            <button 
                className="footer-btn delete" 
                onClick={handleDelete}
                title="حذف النشاط (مسؤول فقط)"
                style={{
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}
            >
                <span>🗑️</span>
                <span>حذف {isAdminView ? '(مسؤول)' : ''}</span>
            </button>
        );
    };

    // ✅ FONCTIONS D'INTERACTION
    const handleLike = async () => {
        if (isLiking || !currentUser) return
        
        setIsLiking(true)
        
        try {
            const newLikeState = !hasLiked
            setHasLiked(newLikeState)
            
            const result = await dispatch(likeActivity(activity._id))
            
            if (!result) {
                setHasLiked(!newLikeState)
            }
        } catch (error) {
            console.error('Erreur like:', error)
            setHasLiked(!hasLiked)
        } finally {
            setIsLiking(false)
        }
    }

    const handleAddComment = async (e) => {
        e.preventDefault()
        if (!commentText.trim() || !currentUser) return

        setIsCommenting(true)
        try {
            await dispatch(addComment(activity._id, { content: commentText }))
            setCommentText('')
        } catch (error) {
            console.error('Erreur commentaire:', error)
        } finally {
            setIsCommenting(false)
        }
    }

    // ✅ FONCTIONS POUR LES RÉPONSES AUX COMMENTAIRES
    const handleReply = (commentId) => {
        setReplyingTo(commentId)
        setReplyText('')
    }

    const cancelReply = () => {
        setReplyingTo(null)
        setReplyText('')
    }

    const handleSubmitReply = async (commentId, e) => {
        e.preventDefault()
        if (!replyText.trim() || !currentUser) return

        setIsReplying(true)
        try {
            console.log('🟢 Envoi de la réponse au commentaire:', commentId)
            await dispatch(replyToComment(activity._id, commentId, { content: replyText }))
            setReplyingTo(null)
            setReplyText('')
            setExpandedReplies(prev => ({ ...prev, [commentId]: true }))
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi de la réponse:', error)
        } finally {
            setIsReplying(false)
        }
    }

    const toggleReplies = (commentId) => {
        setExpandedReplies(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }))
    }

    // ✅ CORRECTION : Fonction Like Commentaire
    const handleLikeComment = async (commentId) => {
        if (!currentUser) return;
        
        try {
            console.log('🟢 Like du commentaire:', commentId);
            await dispatch(likeComment(activity._id, commentId));
            
            setTimeout(() => {
                dispatch(getFilteredActivities(1, 20, { viewMode: 'all' }));
            }, 300);
            
        } catch (error) {
            console.error('❌ Erreur like commentaire:', error);
        }
    };

    // ✅ COMPOSANT COMMENTAIRE
    const CommentItem = ({ comment }) => {
        const hasReplies = comment.replies && comment.replies.length > 0;
        const isExpanded = expandedReplies[comment._id];
        
        const isLiked = calculateUserHasLiked(comment);
        const replyCount = comment.replies ? comment.replies.length : 0;
        const likeCount = comment.likes ? comment.likes.length : 0;

        return (
            <div className="comment-item">
                <div className="comment-avatar-container">
                    <img 
                        src={getAvatarUrl(comment.user)}
                        alt={getUserName(comment.user)}
                        className="comment-avatar"
                    />
                </div>
                <div className="comment-content">
                    <div className="comment-header">
                        <div className="comment-user">
                            <span className="comment-author">{getUserName(comment.user)}</span>
                            <span className="comment-career-plan">
                                {getUserCareerPlan(comment.user)}
                            </span>
                        </div>
                        <div className="comment-meta">
                            <span className="comment-time">
                                {new Date(comment.commented_at).toLocaleString('ar-TN')}
                            </span>
                        </div>
                    </div>
                    <p className="comment-text">{comment.content}</p>
                    
                    <div className="comment-actions">
                        <button 
                            className={`comment-like-btn ${isLiked ? 'liked' : ''}`}
                            onClick={() => handleLikeComment(comment._id)}
                            disabled={!currentUser}
                        >
                            <span 
                                className="like-icon" 
                                style={{ 
                                    color: isLiked ? 'red' : 'gray',
                                    transition: 'color 0.3s ease'
                                }}
                            >
                                {isLiked ? '❤️' : '🤍'}
                            </span>
                            <span className="like-count">{likeCount}</span>
                        </button>
                        
                        <button 
                            className="comment-reply-btn"
                            onClick={() => handleReply(comment._id)}
                            disabled={!currentUser}
                        >
                            <span className="reply-icon">↩️</span>
                            <span>رد</span>
                        </button>
                        
                        {hasReplies && (
                            <button 
                                className="toggle-replies-btn"
                                onClick={() => toggleReplies(comment._id)}
                            >
                                <span className="reply-icon">
                                    {isExpanded ? '⬆️' : '⬇️'}
                                </span>
                                <span>
                                    {isExpanded ? 'إخفاء الردود' : `عرض الردود (${replyCount})`}
                                </span>
                            </button>
                        )}
                    </div>

                    {replyingTo === comment._id && (
                        <Form onSubmit={(e) => handleSubmitReply(comment._id, e)} className="reply-form">
                            <div className="reply-input-container">
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    placeholder="اكتب ردك..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    disabled={isReplying}
                                    className="reply-input"
                                    autoFocus
                                />
                                <div className="reply-actions">
                                    <Button 
                                        type="submit" 
                                        className="reply-submit-btn"
                                        disabled={!replyText.trim() || isReplying}
                                    >
                                        {isReplying ? <Spinner size="sm" /> : 'إرسال'}
                                    </Button>
                                    <Button 
                                        variant="outline-secondary" 
                                        className="reply-cancel-btn"
                                        onClick={cancelReply}
                                        type="button"
                                    >
                                        إلغاء
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    )}

                    {hasReplies && isExpanded && (
                        <div className="replies-list">
                            {comment.replies.map((reply, replyIndex) => (
                                <div key={reply._id || replyIndex} className="reply-item">
                                    <div className="reply-avatar-container">
                                        <img 
                                            src={getAvatarUrl(reply.user)}
                                            alt={getUserName(reply.user)}
                                            className="reply-avatar"
                                        />
                                    </div>
                                    <div className="reply-content">
                                        <div className="reply-header">
                                            <div className="reply-user">
                                                <span className="reply-author">
                                                    {getUserName(reply.user)}
                                                </span>
                                                <span className="reply-career-plan">
                                                    {getUserCareerPlan(reply.user)}
                                                </span>
                                            </div>
                                            <div className="reply-meta">
                                                <span className="reply-time">
                                                    {new Date(reply.replied_at).toLocaleString('ar-TN')}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="reply-text">{reply.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // ✅ FONCTIONS UTILITAIRES (gardez vos fonctions existantes)
    const getGeneralActivityIcon = (activityType) => {
        const icons = {
            'اجتماع': '👥', 'تدريب': '🎓', 'مهمة': '🚀', 'عمل عن بعد': '🏠',
            'تقرير': '📄', 'تحليل': '📊', 'عرض': '📢', 'تدقيق': '🔍',
            'تخطيط': '📅', 'تقييم': '⭐', 'مقابلة': '💼', 'عمل مكتب': '💻',
            'حدث': '🎉', 'أخرى': '📌'
        }
        return icons[activityType] || '📌'
    }

    const getActivityTypeIcon = (activityType) => {
        const icons = {
            'اجتماع داخلي': '🏢', 'اجتماع خارجي': '🌐', 'تدريب داخلي': '🎓',
            'تدريب خارجي': '🌍', 'مهمة ميدانية': '📍', 'مهمة إدارية': '📋',
            // ... gardez vos icônes existantes
        }
        return icons[activityType] || '📌'
    }

    const getGeneralActivityColor = (activityType) => {
        const colors = {
            'اجتماع': '#3498db', 'تدريب': '#9b59b6', 'مهمة': '#e74c3c',
            'عمل عن بعد': '#2ecc71', 'تقرير': '#f39c12', 'تحليل': '#1abc9c',
            // ... gardez vos couleurs existantes
        }
        return colors[activityType] || '#95a5a6'
    }

    const getActivityTypeColor = (activityType) => {
        const colors = {
            'اجتماع داخلي': '#2980b9', 'اجتماع خارجي': '#3498db',
            'تدريب داخلي': '#8e44ad', 'تدريب خارجي': '#9b59b6',
            // ... gardez vos couleurs existantes
        }
        return colors[activityType] || '#95a5a6'
    }

    const displayGeneralActivity = activity.general_activity || 'نشاط'
    const displayActivityType = activity.activity_type || 'نوع النشاط'

    const getAuthorizedUsers = () => {
        if (activity.visibility === 'عام') {
            return [{ name: 'جميع المستخدمين', current: 'الجميع' }]
        }
        
        if (activity.visibility === 'خاص') {
            return [activity.user || { name: 'المالك', current: 'صاحب النشاط' }]
        }
        
        if (activity.visibility === 'مستخدمين محددين') {
            if (activity.identified_users && activity.identified_users.length > 0) {
                return activity.identified_users.map(user => ({
                    name: user.name || 'مستخدم',
                    current: user.current || 'غير محدد',
                    profile_picture: user.profile_picture,
                    email: user.email
                }))
            }
            
            if (activity.authorized_viewers && activity.authorized_viewers.length > 0) {
                return activity.authorized_viewers.map(user => ({
                    name: user.name || 'مستخدم',
                    current: user.current || 'غير محدد',
                    profile_picture: user.profile_picture,
                    email: user.email
                }))
            }
            
            return [{ name: 'لا يوجد مستخدمون محددون', current: 'غير محدد' }]
        }
        
        return []
    }

    const getVisibilityLabel = () => {
        const labels = {
            'عام': '🌍 عام',
            'خاص': '🔒 خاص',
            'مستخدمين محددين': '👥 مستخدمين محددين'
        }
        return labels[activity.visibility] || '🔒 خاص'
    }

    const getVisibilityDescription = () => {
        const authorizedUsers = getAuthorizedUsers()
        const userCount = authorizedUsers.length
        
        if (activity.visibility === 'عام') {
            return `يمكن لجميع المستخدمين رؤية هذا النشاط`
        }
        
        if (activity.visibility === 'خاص') {
            return `يمكن فقط لصاحب النشاط رؤيته`
        }
        
        if (activity.visibility === 'مستخدمين محددين') {
            return `${userCount} مستخدم ${userCount === 1 ? 'مسموح له' : 'مسموح لهم'} برؤية هذا النشاط`
        }
        
        return 'إعدادات الرؤية غير معروفة'
    }

    const calculateDuration = () => {
        if (!activity.start_date || !activity.end_date || !activity.start_time || !activity.end_time) {
            return 'غير محدد'
        }
        
        try {
            const startDate = new Date(activity.start_date)
            const [startHours, startMinutes] = activity.start_time.split(':').map(Number)
            startDate.setHours(startHours, startMinutes, 0, 0)

            const endDate = new Date(activity.end_date)
            const [endHours, endMinutes] = activity.end_time.split(':').map(Number)
            endDate.setHours(endHours, endMinutes, 0, 0)

            const diffMs = endDate - startDate
            
            if (diffMs <= 0) return 'غير محدد'

            const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

            if (diffHours === 0) {
                return `${diffMinutes} دقيقة`
            } else if (diffMinutes === 0) {
                return diffHours === 1 ? 'ساعة واحدة' : `${diffHours} ساعات`
            } else {
                return `${diffHours} ساعة و ${diffMinutes} دقيقة`
            }
        } catch (error) {
            console.error('Erreur calcul durée:', error)
            return 'غير محدد'
        }
    }

    const formatActivityDate = (dateString) => {
        if (!dateString) return 'غير محدد'
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('ar-TN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        } catch (error) {
            return 'غير محدد'
        }
    }

    const handleDownload = (file) => {
        if (file.file_data) {
            const link = document.createElement('a')
            link.href = file.file_data
            link.download = file.filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } else if (file.file_url) {
            const link = document.createElement('a')
            link.href = file.file_url
            link.download = file.filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    const handleViewFile = (file) => {
        if (file.file_url) {
            window.open(file.file_url, '_blank');
        }
    }

    const canPreviewFile = (fileType) => {
        return ['image', 'pdf'].includes(fileType)
    }

    const getFileIcon = (fileType) => {
        const icons = {
            document: '📄', image: '🖼️', présentation: '📊', tableur: '📈',
            pdf: '📑', video: '🎬', audio: '🎵', archive: '📦', autre: '📎'
        }
        return icons[fileType] || '📎'
    }

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 Bytes'
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(1024))
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    }

    const getUserCareerPlan = (user) => {
        return user?.current_career_plan || user?.current || 'لا يوجد تخصص'
    }

    const getUserName = (user) => {
        return user?.name || 'مستخدم غير معروف'
    }

    const getAvatarUrl = (user) => {
        return user?.profile_picture || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEN0Q4REIiLz4KPC9zdmc+'
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'غير محدد'
        try {
            const date = new Date(dateString)
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }
            return date.toLocaleDateString('ar-TN', options)
        } catch (error) {
            return 'غير محدد'
        }
    }

    const getEngagementMetrics = () => {
        return {
            likes: activity.engagement_metrics?.likes_count || activity.likes?.length || 0,
            comments: activity.engagement_metrics?.comments_count || activity.comments?.length || 0,
            views: activity.engagement_metrics?.views_count || 0
        }
    }

    const authorizedUsers = getAuthorizedUsers()
    const visibilityDescription = getVisibilityDescription()
    const metrics = getEngagementMetrics()

    return (
        <>
            {/* ✅ BADGE ADMIN */}
            {isAdminView && (
                <div className="activity-admin-badge" style={{
                    padding: '8px 12px',
                    backgroundColor: '#fff3cd',
                    borderBottom: '1px solid #ffeaa7',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                }}>
                    <Badge bg="warning">👑 عرض المسؤول</Badge>
                    {activity.visibility === 'خاص' && <Badge bg="secondary">🔒 خاص</Badge>}
                    {activity.visibility === 'عام' && <Badge bg="success">🌍 عام</Badge>}
                    {activity.visibility === 'مستخدمين محددين' && <Badge bg="info">🎯 محدد</Badge>}
                    {isAdminView && isOwner && <Badge bg="outline-primary" className="owner-badge">المالك</Badge>}
                </div>
            )}

            {/* Modal pour afficher les utilisateurs autorisés */}
            <Modal show={showAuthorizedUsers} onHide={() => setShowAuthorizedUsers(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        👥 المستخدمون المسموح لهم بالمشاهدة
                        <Badge bg="primary" className="ms-2">{authorizedUsers.length}</Badge>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="authorized-users-list">
                        {authorizedUsers.map((user, index) => (
                            <div key={index} className="authorized-user-item">
                                <div className="user-avatar-container">
                                    <img 
                                        src={getAvatarUrl(user)}
                                        alt={user.name}
                                        className="user-avatar-small"
                                    />
                                </div>
                                <div className="user-details">
                                    <div className="user-name">{user.name}</div>
                                    <div className="user-current">{user.current}</div>
                                    {user.email && (
                                        <div className="user-email">
                                            <small>{user.email}</small>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAuthorizedUsers(false)}>
                        إغلاق
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* ✅ INDICATEUR DE NOUVELLE ACTIVITÉ */}
            {shouldShowNewIndicator && (
                <div className="new-activity-indicator" style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#dc3545',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite',
                    zIndex: 10,
                    boxShadow: '0 0 8px rgba(220, 53, 69, 0.7)'
                }} 
                title="نشاط جديد"
                />
            )}

            {/* Carte d'activité */}
            <Card 
                className={`activity-card ${shouldShowNewIndicator ? 'new-activity' : ''}`}
                style={{ position: 'relative' }}
                onClick={handleCardClick}
            >
                <Card.Header className="activity-header">
                    <div className="user-info">
                        <img 
                            src={getAvatarUrl(activity.user)}
                            alt={getUserName(activity.user)}
                            className="user-avatar"
                        />
                        <div className="user-details">
                            <h6 className="user-name">{getUserName(activity.user)}</h6>
                            <p className="user-career-plan">
                                {getUserCareerPlan(activity.user)}
                            </p>
                        </div>
                    </div>
                    <div className="activity-meta">
                        {/* ✅ BADGE "جديد" */}
                        {shouldShowNewIndicator && (
                            <Badge 
                                bg="danger" 
                                className="me-2 new-activity-badge"
                                style={{ 
                                    fontSize: '0.7rem',
                                    animation: 'pulse 1.5s infinite'
                                }}
                            >
                                جديد
                            </Badge>
                        )}
                        <span 
                            className="visibility-badge"
                            onClick={() => setShowAuthorizedUsers(true)}
                            style={{ cursor: 'pointer' }}
                            title={visibilityDescription}
                        >
                            {getVisibilityLabel()}
                        </span>
                        <span className="activity-time">{formatDate(activity.createdAt)}</span>
                    </div>
                </Card.Header>

                <Card.Body className="activity-content">
                    {/* ✅ SECTION TYPES D'ACTIVITÉS */}
                    <div className="activity-type-badges">
                        <span 
                            className="type-badge primary"
                            style={{
                                backgroundColor: getGeneralActivityColor(displayGeneralActivity),
                                color: 'white'
                            }}
                        >
                            <span className="badge-icon">
                                {getGeneralActivityIcon(displayGeneralActivity)}
                            </span>
                            {displayGeneralActivity}
                        </span>
                        <span 
                            className="type-badge secondary"
                            style={{
                                backgroundColor: getActivityTypeColor(displayActivityType),
                                color: 'white'
                            }}
                        >
                            <span className="badge-icon">
                                {getActivityTypeIcon(displayActivityType)}
                            </span>
                            {displayActivityType}
                        </span>
                    </div>

                    <h5 className="activity-subject">{activity.activity_subject}</h5>

                    {/* Section Timing */}
                    <div className="activity-timing-info">
                        <div className="timing-header">
                            <h6 className="timing-title">معلومات التوقيت</h6>
                        </div>
                        
                        <div className="timing-grid">
                            <div className="timing-item">
                                <div className="timing-icon">📅</div>
                                <div className="timing-content">
                                    <span className="timing-label">بداية النشاط</span>
                                    <span className="timing-value">
                                        {formatActivityDate(activity.start_date)}
                                    </span>
                                    <span className="timing-time">{activity.start_time}</span>
                                </div>
                            </div>
                            
                            <div className="timing-item">
                                <div className="timing-icon">⏰</div>
                                <div className="timing-content">
                                    <span className="timing-label">نهاية النشاط</span>
                                    <span className="timing-value">
                                        {formatActivityDate(activity.end_date)}
                                    </span>
                                    <span className="timing-time">{activity.end_time}</span>
                                </div>
                            </div>
                            
                            <div className="timing-duration-section">
                                <div className="duration-content">
                                    <div className="duration-icon">⏱️</div>
                                    <div className="duration-text">
                                        <span className="duration-label">المدة الإجمالية</span>
                                        <span className="duration-value">{calculateDuration()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Collapse in={showDetails}>
                        <div>
                            {/* ✅ SECTION DESCRIPTION */}
                            {activity.description && (
                                <div className="activity-description-section">
                                    <h6 className="description-label">📄 الوصف:</h6>
                                    <p className="activity-description">{activity.description}</p>
                                </div>
                            )}

                            {/* ✅ SECTION NOTES */}
                            {activity.notes && (
                                <div className="activity-notes-section">
                                    <h6 className="notes-label">📝 الملاحظات:</h6>
                                    <p className="activity-notes">{activity.notes}</p>
                                </div>
                            )}

                            {/* ✅ SECTION UPLOADS */}
                            <div className="activity-uploads-section">
                                <h6 className="uploads-label">📎 الملفات المرفقة:</h6>
                                {activity.uploads && activity.uploads.length > 0 ? (
                                    <div className="uploads-list">
                                        {activity.uploads.map((file, index) => (
                                            <div key={file._id || index} className="upload-item">
                                                <div className="file-icon">
                                                    {getFileIcon(file.file_type)}
                                                </div>
                                                <div className="file-info">
                                                    <span className="file-name">{file.filename}</span>
                                                    <span className="file-size">({formatFileSize(file.file_size)})</span>
                                                </div>
                                                <div className="file-actions">
                                                    {canPreviewFile(file.file_type) && (
                                                        <Button
                                                            variant="outline-info"
                                                            size="sm"
                                                            onClick={() => handleViewFile(file)}
                                                            className="view-file-btn"
                                                            title="استعراض الملف"
                                                        >
                                                            👁️ معاينة
                                                        </Button>
                                                    )}
                                                    
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => handleDownload(file)}
                                                        className="download-btn"
                                                        title="تحميل الملف"
                                                    >
                                                        ⬇️ تحميل
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-files-text">لا توجد ملفات مرفقة</p>
                                )}
                            </div>
                        </div>
                    </Collapse>

                    <div className="details-toggle">
                        <Button 
                            variant="link" 
                            className="toggle-btn"
                            onClick={() => {
                                setShowDetails(!showDetails);
                                if (isNewActivity) {
                                    markActivityAsViewed();
                                }
                            }}
                        >
                            {showDetails ? '📋 إخفاء التفاصيل' : '📋 عرض التفاصيل'}
                        </Button>
                    </div>
                </Card.Body>

                <div className="engagement-actions">
                    <div className="action-stats">
                        <div className="stat-item">
                            <span className="stat-count">{metrics.likes}</span>
                            <span className="stat-label">إعجاب</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-count">{metrics.comments}</span>
                            <span className="stat-label">تعليق</span>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button 
                            className={`like-btn ${hasLiked ? 'liked' : ''}`}
                            onClick={handleLike}
                            disabled={isLiking || !currentUser}
                        >
                            <span className="like-icon" style={{ color: hasLiked ? 'red' : 'gray' }}>
                                {hasLiked ? '❤️' : '🤍'}
                            </span>
                            <span className="like-text">
                                {hasLiked ? 'معجب به' : 'إعجاب'}
                            </span>
                            {isLiking && <div className="like-loading"></div>}
                        </button>
                        
                        <button 
                            className={`comment-btn ${showComments ? 'active' : ''}`}
                            onClick={() => {
                                setShowComments(!showComments);
                                if (isNewActivity) {
                                    markActivityAsViewed();
                                }
                            }}
                            disabled={!currentUser}
                        >
                            <span className="comment-icon">💬</span>
                            <span className="comment-text">تعليق</span>
                        </button>
                    </div>
                </div>

                <Collapse in={showComments}>
                    <div className="comments-section">
                        <div className="comments-header">
                            <h6 className="comments-title">التعليقات ({metrics.comments})</h6>
                        </div>

                        {activity.comments && activity.comments.length > 0 ? (
                            <div className="comments-list">
                                {activity.comments.map((comment, index) => (
                                    <CommentItem 
                                        key={comment._id || index} 
                                        comment={comment}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="no-comments">
                                <div className="no-comments-icon">💬</div>
                                <p className="no-comments-text">لا توجد تعليقات بعد</p>
                            </div>
                        )}

                        {currentUser && (
                            <Form onSubmit={handleAddComment} className="comment-form">
                                <div className="comment-input-container">
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder="أضف تعليقك..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        disabled={isCommenting}
                                        className="comment-input"
                                    />
                                    <Button 
                                        type="submit" 
                                        className="comment-submit-btn"
                                        disabled={!commentText.trim() || isCommenting}
                                    >
                                        {isCommenting ? <Spinner size="sm" /> : 'إرسال'}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </div>
                </Collapse>

                <Card.Footer className="activity-footer">
                    <div className="footer-info">
                        <span className="update-time">
                            آخر تحديث: {formatDate(activity.updatedAt)}
                        </span>
                    </div>
                    <div className="footer-actions">
                        <EditButton />
                        <DeleteButton />
                    </div>
                </Card.Footer>
            </Card>

            {/* ✅ INDICATEUR DE DEBUG (à retirer en production) */}
            {process.env.NODE_ENV === 'development' && (
                <div style={{
                    position: 'fixed',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    zIndex: 9999
                }}>
                    🐛 DEBUG: {shouldShowNewIndicator ? 'NOUVELLE 🆕' : 'VUE 👀'} 
                    | ID: {activity._id}
                </div>
            )}
        </>
    )
}

export default ActivityCard