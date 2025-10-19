
// pages/activities/Activities.jsx - VERSION COMPLÈTE AVEC BADGE
import React, { useState, useEffect } from 'react'
import { Container, Button, Alert, Modal } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getAllActivities, getFilteredActivities, searchActivities, deleteActivity } from '../../JS/actions/ActivityAction'
import { current } from '../../JS/actions/AuthAction'
import { getUnviewedActivitiesCount } from '../../JS/actions/NotificationActivityAction'
import ActivityForm from './ActivityForm'
import ActivityCard from '../../components/activity/ActivityCard'
import WorkHoursCounter from '../../components/WorkHoursCounter/WorkHoursCounter'
import AdvancedFilters from '../../components/AdvancedFilters/AdvancedFilters'
import Avatar from '../../components/Avatar/Avatar'
import './Activities.css'

const Activities = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const activity = useSelector(state => state.activityReducer)
  const auth = useSelector(state => state.authReducer)
  const activityUnviewedCount = useSelector(state => state.notificationActivityReducer?.unviewedCount || 0)

  const [forceRefresh, setForceRefresh] = useState(0)
  
  // ✅ CORRECTION CRITIQUE : Détection robuste du rôle admin
  const isAdmin = () => {
    const user = auth.user || auth.currentUser;
    return user?.role === 'admin' || auth.role === 'admin';
  };
  
  const adminStatus = isAdmin();
  
  console.log('🔐 ACTIVITIES - User object:', auth.user)
  console.log('🔐 ACTIVITIES - User role:', auth.user?.role)
  console.log('🔐 ACTIVITIES - Auth role:', auth.role)
  console.log('🔐 ACTIVITIES - Is admin:', adminStatus)
  console.log('🔐 ACTIVITIES - Full auth state:', auth)

  const [showForm, setShowForm] = useState(false)
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState('all')
  const [appliedFilters, setAppliedFilters] = useState({})
  const [editingActivity, setEditingActivity] = useState(null)

  const currentUserId = auth.user?._id || auth.user?.id || auth.userId

  // ✅ CORRECTION : Forcer le rechargement des données utilisateur
  useEffect(() => {
    if (auth.isAuth && !auth.user?.role) {
      console.log('🔄 ACTIVITIES - Reloading user data...')
      dispatch(current())
    }
  }, [auth.isAuth, auth.user?.role, dispatch])

  // ✅ CHARGEMENT DU COMPTEUR D'ACTIVITÉS NON CONSULTÉES
  useEffect(() => {
    if (auth.isAuth) {
      dispatch(getUnviewedActivitiesCount());
    }
  }, [dispatch, auth.isAuth]);

  // ✅ CORRECTION : Fonction pour gérer la modification des activités
  const handleEditActivity = (activityToEdit) => {
    console.log('🔄 Début de la modification:', activityToEdit);
    console.log('🔐 User is admin:', adminStatus);
    
    // ✅ CORRECTION CRITIQUE : Vérifier que l'activité est bien définie
    if (!activityToEdit || !activityToEdit._id) {
      console.error('❌ ACTIVITIES - Activité non définie pour modification');
      alert('Erreur: Impossible de modifier cette activité');
      return;
    }

    console.log('✅ ACTIVITIES - Ouverture du formulaire avec activité:', {
      id: activityToEdit._id,
      subject: activityToEdit.activity_subject,
      start_date: activityToEdit.start_date,
      end_date: activityToEdit.end_date
    });

    setEditingActivity(activityToEdit);
    setShowForm(true);
  };

  // ✅ CORRECTION : Fonction pour gérer la suppression (admin seulement)
  const handleDeleteActivity = (activityId) => {
    console.log('🗑️ Delete activity called for:', activityId);
    console.log('🔐 User is admin:', adminStatus);
    
    if (!adminStatus) {
      console.log('❌ ACTIVITIES - User not admin, cannot delete');
      alert('❌ يجب أن تكون مسؤولاً لحذف الأنشطة');
      return;
    }
    
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا النشاط؟')) {
      console.log('✅ ACTIVITIES - Admin deleting activity:', activityId);
      dispatch(deleteActivity(activityId));
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingActivity(null);
  };

  // Redirection si non authentifié
  useEffect(() => {
    if (!auth.isAuth) {
      navigate('/login')
    }
  }, [auth.isAuth, navigate])

  // Charger les activités selon le mode de vue
  useEffect(() => {
    if (auth.isAuth) {
      loadActivitiesForViewMode();
    }
  }, [dispatch, auth.isAuth, viewMode, currentPage, appliedFilters, forceRefresh]);

  // ✅ CORRECTION CRITIQUE : Fonction de filtrage pour ADMIN - VOIR TOUT
  const checkIfUserIsIdentified = (activityItem, userId) => {
    if (!activityItem.identified_users || !Array.isArray(activityItem.identified_users)) {
      return false;
    }
    
    return activityItem.identified_users.some(identifiedUser => {
      if (typeof identifiedUser === 'object' && identifiedUser !== null) {
        const identifiedUserId = identifiedUser.user?._id || identifiedUser.user || identifiedUser._id;
        return identifiedUserId === userId;
      } else {
        return identifiedUser === userId;
      }
    });
  };

  // ✅ CORRECTION CRITIQUE : Admin voit TOUTES les activités sans filtrage
  const filterActivitiesByVisibility = (activities, userId) => {
    if (!activities || activities.length === 0) {
      return [];
    }

    // ✅ CORRECTION : SI ADMIN, RETOURNER TOUTES LES ACTIVITÉS SANS FILTRAGE
    if (adminStatus) {
      console.log('👑 ADMIN MODE - Affichage de TOUTES les activités sans filtrage:', activities.length);
      return activities;
    }

    // ✅ Logique normale pour les utilisateurs non-admin
    return activities.filter(activityItem => {
      const isOwner = activityItem.user?._id === userId || activityItem.user === userId;
      if (isOwner) {
        return true;
      }

      switch (activityItem.visibility) {
        case 'عام':
          return true;
        case 'خاص':
          return false;
        case 'مستخدمين محددين':
          return checkIfUserIsIdentified(activityItem, userId);
        default:
          return false;
      }
    });
  };

  const loadActivitiesForViewMode = () => {
    const filters = {
      viewMode: viewMode,
      page: currentPage,
      ...appliedFilters
    };
    
    console.log('🟢 LOADING ACTIVITIES WITH FILTERS:', filters);
    console.log('👤 CURRENT USER ID:', currentUserId);
    console.log('🔐 USER ROLE:', auth.user?.role);
    console.log('🔐 IS ADMIN:', adminStatus);
    
    if (appliedFilters.search || appliedFilters.activityType || appliedFilters.startDate || appliedFilters.endDate) {
      dispatch(searchActivities(filters));
    } else {
      dispatch(getFilteredActivities(currentPage, 20, filters));
    }
  };

  const handleFiltersApplied = (filters) => {
    setAppliedFilters(filters);
    setCurrentPage(1);
    setShowFiltersModal(false);
  };

  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode);
    setCurrentPage(1);
    setAppliedFilters({});
  };

  const handleResetFilters = () => {
    setAppliedFilters({});
    setCurrentPage(1);
    setViewMode('all');
    dispatch(getFilteredActivities(1, 20, { viewMode: 'all' }));
  };

  // ✅ CORRECTION : Forcer le refresh des données
  const handleForceRefresh = () => {
    console.log('🔄 FORCING REFRESH...');
    setForceRefresh(prev => prev + 1);
    dispatch(current());
    dispatch(getUnviewedActivitiesCount());
  };

  const getActivitiesToDisplay = () => {
    let activities = activity.activities || [];
    
    console.log('📊 Activités avant filtrage:', activities.length);
    
    // ✅ CORRECTION : Appliquer le filtrage selon les permissions
    if (activities.length > 0) {
      activities = filterActivitiesByVisibility(activities, currentUserId);
    }
    
    console.log('📊 Activités après filtrage:', activities.length);
    console.log('👑 Mode admin:', adminStatus);
    
    return activities;
  };

  const activitiesToDisplay = getActivitiesToDisplay();

  const countIdentifiedActivities = () => {
    if (!activitiesToDisplay.length || !currentUserId) return 0;
    return activitiesToDisplay.filter(activityItem => 
      checkIfUserIsIdentified(activityItem, currentUserId)
    ).length;
  };

  const getStats = () => {
    const activities = activitiesToDisplay;
    const total = activities.length
    const inProgress = activities.filter(a => isActivityInProgress(a)).length
    const completed = activities.filter(a => isActivityCompleted(a)).length
    const meetings = activities.filter(a => a.general_activity === 'اجتماع').length
    const audits = activities.filter(a => a.general_activity === 'تدقيق').length
    const identified = countIdentifiedActivities()
    
    return { total, inProgress, completed, meetings, audits, identified }
  }

  const isActivityInProgress = (activityItem) => {
    if (!activityItem.start_date || !activityItem.end_date) return false
    const now = new Date()
    const start = new Date(activityItem.start_date)
    const end = new Date(activityItem.end_date)
    return now >= start && now <= end
  }

  const isActivityCompleted = (activityItem) => {
    if (!activityItem.end_date) return false
    const now = new Date()
    const end = new Date(activityItem.end_date)
    return now > end
  }

  const stats = getStats()

  const getViewModeText = () => {
    const baseText = {
      'all': adminStatus ? '📁 عرض جميع الأنشطة (المسؤول)' : '📁 عرض جميع الأنشطة',
      'my': '👤 عرض أنشطتي فقط', 
      'identified': `🎯 عرض الأنشطة التي تم تحديدي فيها (${stats.identified})`,
      'public': '🌍 عرض الأنشطة العامة فقط'
    }[viewMode] || '📁 عرض الأنشطة';

    return baseText;
  }

  const getEmptyStateText = () => {
    switch (viewMode) {
      case 'my': 
        return { icon: '👤', title: 'لا توجد أنشطة خاصة بك', description: 'ابدأ بنشر أول نشاط لك لمشاركة أعمالك مع الزملاء' };
      case 'identified':
        return { icon: '🎯', title: 'لا توجد أنشطة تم تحديدك فيها', description: 'سيظهر هنا الأنشطة التي تم تحديدك فيها من قبل الآخرين' };
      case 'public':
        return { icon: '🌍', title: 'لا توجد أنشطة عامة', description: 'لا توجد أنشطة عامة متاحة حالياً' };
      default:
        return { 
          icon: '📝', 
          title: adminStatus ? 'لا توجد أنشطة في النظام' : 'لا توجد أنشطة', 
          description: adminStatus ? 'لا توجد أنشطة منشورة في النظام حالياً' : 'ابدأ بنشر أول نشاط في النظام' 
        };
    }
  }

  if (!auth.isAuth) {
    return (
      <Container className="mt-5">
        <Alert variant="warning" className="text-center">
          يرجى تسجيل الدخول للوصول إلى الأنشطة
        </Alert>
      </Container>
    )
  }

  const emptyState = getEmptyStateText();

  return (
    <div className="activities-page">
      <Modal 
        show={showFiltersModal} 
        onHide={() => setShowFiltersModal(false)} 
        size="lg"
        className="advanced-filters-modal"
        dir="rtl"
      >
        <Modal.Header closeButton>
          <Modal.Title>🔍 خيارات البحث المتقدم</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AdvancedFilters 
            onFiltersApplied={handleFiltersApplied}
            onCancel={() => setShowFiltersModal(false)}
          />
        </Modal.Body>
      </Modal>

      <header className="professional-header">
        <div className="header-content">
          <div className="header-title">
            <h1>📋 جدار الأنشطة</h1>
            <span className="badge">النظام المهني</span>
            {adminStatus && <span className="badge admin-badge">👑 المسؤول</span>}
            <Button 
              variant="outline-warning" 
              size="sm" 
              onClick={handleForceRefresh}
              className="refresh-btn"
            >
              🔄 تحديث البيانات
            </Button>
          </div>
          <div className="header-actions">
            <Button 
              variant="outline-primary" 
              onClick={() => setShowFiltersModal(true)}
              className="filter-btn"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🔍 خيارات البحث
              
              {/* ✅ POINT ROUGE CLIGNOTANT POUR NOUVELLES ACTIVITÉS */}
              {activityUnviewedCount > 0 && (
                <div 
                  className="new-activities-indicator"
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={`${activityUnviewedCount} نشاط جديد`}
                >
                  <div 
                    style={{
                      width: '10px',
                      height: '10px',
                      backgroundColor: '#dc3545',
                      borderRadius: '50%',
                      animation: 'pulse 1.5s infinite',
                      boxShadow: '0 0 6px rgba(220, 53, 69, 0.8)',
                      cursor: 'pointer'
                    }}
                  />
                  
                  {/* ✅ COMPTEUR SI PLUS D'UNE ACTIVITÉ */}
                  {activityUnviewedCount > 1 && (
                    <span 
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        color: '#dc3545',
                        marginLeft: '4px',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        padding: '1px 4px',
                        borderRadius: '8px',
                        minWidth: '16px',
                        textAlign: 'center'
                      }}
                    >
                      {activityUnviewedCount}
                    </span>
                  )}
                </div>
              )}
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                setEditingActivity(null);
                setShowForm(true);
              }}
              className="add-activity-btn"
            >
              + نشاط جديد
            </Button>
          </div>
        </div>
      </header>

      {adminStatus && (
        <Alert variant="info" className="admin-banner">
          <div className="admin-banner-content">
            <strong>👑 وضع المسؤول نشط</strong> 
            <span className="admin-permissions">- يمكنك رؤية وتعديل وحذف جميع الأنشطة في النظام (خاصة، عامة، محددة)</span>
          </div>
        </Alert>
      )}

      <div className="activities-container">
        <aside className="sidebar-left">
          <div className="view-mode-section">
            <h3 className="section-title">👁️ عرض الأنشطة</h3>
            <button className={`view-mode-btn ${viewMode === 'all' ? 'active' : ''}`} onClick={() => handleViewModeChange('all')}>
              {adminStatus ? '📁 جميع الأنشطة (المسؤول)' : '📁 جميع الأنشطة'}
            </button>
            <button className={`view-mode-btn ${viewMode === 'my' ? 'active' : ''}`} onClick={() => handleViewModeChange('my')}>👤 أنشطتي فقط</button>
            <button className={`view-mode-btn ${viewMode === 'identified' ? 'active' : ''}`} onClick={() => handleViewModeChange('identified')}>🎯 تم تحديدي فيها ({stats.identified})</button>
            <button className={`view-mode-btn ${viewMode === 'public' ? 'active' : ''}`} onClick={() => handleViewModeChange('public')}>🌍 عامة فقط</button>
          </div>

          <div className="stats-section">
            <h3 className="section-title">📊 الإحصائيات</h3>
            <div className="stat-item"><div className="stat-info"><div className="stat-icon total">📈</div><div className="stat-text"><span className="stat-label">الأنشطة المعروضة</span><span className="stat-value">{stats.total}</span></div></div></div>
            <div className="stat-item"><div className="stat-info"><div className="stat-icon progress">🔄</div><div className="stat-text"><span className="stat-label">قيد التنفيذ</span><span className="stat-value">{stats.inProgress}</span></div></div></div>
            <div className="stat-item"><div className="stat-info"><div className="stat-icon completed">✅</div><div className="stat-text"><span className="stat-label">مكتمل</span><span className="stat-value">{stats.completed}</span></div></div></div>
            <div className="stat-item"><div className="stat-info"><div className="stat-icon meetings">🤝</div><div className="stat-text"><span className="stat-label">اجتماعات</span><span className="stat-value">{stats.meetings}</span></div></div></div>
            <div className="stat-item"><div className="stat-info"><div className="stat-icon audits">🔍</div><div className="stat-text"><span className="stat-label">تفقدات</span><span className="stat-value">{stats.audits}</span></div></div></div>
            
            {/* ✅ STATISTIQUE DES NOUVELLES ACTIVITÉS */}
            <div className="stat-item">
              <div className="stat-info">
                <div className="stat-icon" style={{ color: activityUnviewedCount > 0 ? '#dc3545' : '#6c757d' }}>
                  {activityUnviewedCount > 0 ? '🔴' : '⚪'}
                </div>
                <div className="stat-text">
                  <span className="stat-label">أنشطة جديدة</span>
                  <span 
                    className="stat-value" 
                    style={{ color: activityUnviewedCount > 0 ? '#dc3545' : '#6c757d' }}
                  >
                    {activityUnviewedCount}
                  </span>
                </div>
              </div>
            </div>

            {adminStatus && (
              <div className="stat-item admin-stat">
                <div className="stat-info">
                  <div className="stat-icon admin">👑</div>
                  <div className="stat-text">
                    <span className="stat-label">صلاحيات المسؤول</span>
                    <span className="stat-value">مفعلة</span>
                  </div>
                </div>
                <div className="admin-details">
                  <small>يمكنك رؤية جميع الأنشطة</small>
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="activities-feed">
          <div className="view-mode-indicator">
            <div className="view-mode-info">
              <span className="view-mode-text">{getViewModeText()}</span>
              {(Object.keys(appliedFilters).length > 0 || viewMode !== 'all') && (
                <div className="filters-status">
                  <span className="filters-applied-badge">🔍 فلاتر مطبقة</span>
                  <Button variant="outline-secondary" size="sm" onClick={handleResetFilters} className="reset-filters-btn">إعادة التعيين</Button>
                </div>
              )}
            </div>
            <span className="activities-count">{activitiesToDisplay.length} نشاط</span>
          </div>

          <div className="publish-section">
            <div className="publish-header">
              <Avatar src={auth.user?.profile_picture} alt={auth.user?.name} className="user-avatar-publish" size="md" />
              <div className="publish-input" onClick={() => { setEditingActivity(null); setShowForm(true); }}>
                ما الذي تريد نشره اليوم؟ {auth.user?.name}
                {adminStatus && <span className="admin-indicator"> 👑</span>}
              </div>
            </div>
            <div className="publish-actions">
              <div className="publish-action" onClick={() => { setEditingActivity(null); setShowForm(true); }}><span>🤝</span><span>اجتماع</span></div>
              <div className="publish-action" onClick={() => { setEditingActivity(null); setShowForm(true); }}><span>🔍</span><span>تفقد</span></div>
              <div className="publish-action" onClick={() => { setEditingActivity(null); setShowForm(true); }}><span>📝</span><span>نشاط</span></div>
              <div className="publish-action" onClick={() => { setEditingActivity(null); setShowForm(true); }}><span>⚡</span><span>سريع</span></div>
            </div>
          </div>

          {activity.errors && activity.errors.length > 0 && (
            <Alert variant="danger" className="mb-3">
              <ul className="mb-0">{activity.errors.map((error, index) => (<li key={index}>{error.msg || error}</li>))}</ul>
            </Alert>
          )}

          {activity.success && activity.success.length > 0 && (
            <Alert variant="success" className="mb-3">{Array.isArray(activity.success) ? activity.success.join(', ') : activity.success}</Alert>
          )}

          {activity.loadActivity && activitiesToDisplay.length === 0 ? (
            <div className="loading-state"><div className="loading-spinner"></div><p className="loading-text">جاري تحميل الأنشطة...</p></div>
          ) : activitiesToDisplay.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{emptyState.icon}</div>
              <h3 className="empty-title">{emptyState.title}</h3>
              <p className="empty-description">{emptyState.description}</p>
              {viewMode === 'all' && (<Button variant="primary" onClick={() => { setEditingActivity(null); setShowForm(true); }}>نشر أول نشاط</Button>)}
            </div>
          ) : (
            <>
              {activitiesToDisplay.map(activityItem => (
                <ActivityCard 
                  key={activityItem._id} 
                  activity={activityItem} 
                  isUserIdentified={checkIfUserIsIdentified(activityItem, currentUserId)}
                  onEdit={handleEditActivity}
                  isAdmin={adminStatus}
                  onDelete={handleDeleteActivity}
                  currentUserId={currentUserId}
                />
              ))}
              
              {activity.pagination && currentPage < activity.pagination.pages && (
                <div className="text-center mt-4">
                  <Button variant="outline-primary" onClick={() => setCurrentPage(prev => prev + 1)} disabled={activity.loadActivity}>
                    {activity.loadActivity ? 'جاري التحميل...' : 'تحميل المزيد'}
                  </Button>
                </div>
              )}
            </>
          )}
        </main>

        <aside className="sidebar-right">
          <div className="work-hours-section"><WorkHoursCounter /></div>
        </aside>
      </div>

      <ActivityForm 
        show={showForm} 
        onHide={handleCloseForm} 
        activityToEdit={editingActivity}
        onSuccess={() => {
          console.log('✅ Activité sauvegardée avec succès');
          handleForceRefresh();
        }}
      />
    </div>
  )
}

export default Activities