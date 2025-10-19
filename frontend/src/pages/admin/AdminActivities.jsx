// pages/admin/AdminActivities.jsx
import React, { useState, useEffect } from 'react'
import { Container, Button, Alert, Badge, Card, Row, Col } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getFilteredActivities, deleteActivity } from '../../JS/actions/ActivityAction'
import ActivityForm from '../activites/ActivityForm'
import ActivityCard from '../../components/activity/ActivityCard'
import './AdminActivities.css'

const AdminActivities = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const activity = useSelector(state => state.activityReducer)
  const auth = useSelector(state => state.authReducer)

  const [showForm, setShowForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    private: 0,
    public: 0,
    withIdentified: 0,
    meetings: 0,
    training: 0
  })

  const isAdmin = auth.user?.role === 'admin'

  // Redirection si non admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/error')
    }
  }, [isAdmin, navigate])

  // Charger toutes les activités
  useEffect(() => {
    if (isAdmin) {
      loadAllActivities()
    }
  }, [dispatch, isAdmin, currentPage])

  const loadAllActivities = () => {
    dispatch(getFilteredActivities(currentPage, 50, { viewMode: 'all' }))
  }

  // Calculer les statistiques
  useEffect(() => {
    if (activity.activities && activity.activities.length > 0) {
      const activities = activity.activities
      const newStats = {
        total: activities.length,
        published: activities.filter(a => a.is_published).length,
        private: activities.filter(a => a.visibility === 'خاص').length,
        public: activities.filter(a => a.visibility === 'عام').length,
        withIdentified: activities.filter(a => a.identified_users && a.identified_users.length > 0).length,
        meetings: activities.filter(a => a.general_activity === 'اجتماع').length,
        training: activities.filter(a => a.general_activity === 'تدريب').length
      }
      setStats(newStats)
    }
  }, [activity.activities])

  const handleDeleteActivity = (activityId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette activité ? Cette action est irréversible.')) {
      dispatch(deleteActivity(activityId))
    }
  }

  const handleEditActivity = (activityToEdit) => {
    setEditingActivity(activityToEdit)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingActivity(null)
    loadAllActivities() // Recharger après modification
  }

  const handleCreateNew = () => {
    setEditingActivity(null)
    setShowForm(true)
  }

  if (!isAdmin) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" className="text-center">
          ⚠️ Accès réservé aux administrateurs
        </Alert>
      </Container>
    )
  }

  return (
    <div className="admin-activities-page">
      {/* Header Admin */}
      <header className="admin-activities-header">
        <Container>
          <div className="header-content">
            <div className="header-title">
              <h1>👑 لوحة تحكم الأنشطة - المسؤول</h1>
              <p className="header-subtitle">إدارة كاملة لجميع الأنشطة في النظام</p>
            </div>
            <div className="header-actions">
              <Button 
                variant="primary" 
                onClick={handleCreateNew}
                className="add-activity-btn"
              >
                + إضافة نشاط جديد
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/activities')}
              >
                👁️ العودة للواجهة العادية
              </Button>
            </div>
          </div>
        </Container>
      </header>

      <Container className="admin-activities-container">
        <Row>
          {/* Sidebar des statistiques */}
          <Col md={3}>
            <Card className="admin-stats-card">
              <Card.Header>
                <h5>📊 إحصائيات الأنشطة</h5>
              </Card.Header>
              <Card.Body>
                <div className="admin-stat-item">
                  <div className="stat-icon total">📈</div>
                  <div className="stat-info">
                    <span className="stat-label">إجمالي الأنشطة</span>
                    <span className="stat-value">{stats.total}</span>
                  </div>
                </div>
                
                <div className="admin-stat-item">
                  <div className="stat-icon published">✅</div>
                  <div className="stat-info">
                    <span className="stat-label">منشورة</span>
                    <span className="stat-value">{stats.published}</span>
                  </div>
                </div>
                
                <div className="admin-stat-item">
                  <div className="stat-icon private">🔒</div>
                  <div className="stat-info">
                    <span className="stat-label">خاصة</span>
                    <span className="stat-value">{stats.private}</span>
                  </div>
                </div>
                
                <div className="admin-stat-item">
                  <div className="stat-icon public">🌍</div>
                  <div className="stat-info">
                    <span className="stat-label">عامة</span>
                    <span className="stat-value">{stats.public}</span>
                  </div>
                </div>
                
                <div className="admin-stat-item">
                  <div className="stat-icon identified">🎯</div>
                  <div className="stat-info">
                    <span className="stat-label">بمستخدمين محددين</span>
                    <span className="stat-value">{stats.withIdentified}</span>
                  </div>
                </div>

                <div className="admin-stat-item">
                  <div className="stat-icon meetings">🤝</div>
                  <div className="stat-info">
                    <span className="stat-label">اجتماعات</span>
                    <span className="stat-value">{stats.meetings}</span>
                  </div>
                </div>

                <div className="admin-stat-item">
                  <div className="stat-icon training">🎓</div>
                  <div className="stat-info">
                    <span className="stat-label">تدريبات</span>
                    <span className="stat-value">{stats.training}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="admin-actions-card mt-3">
              <Card.Header>
                <h5>⚙️ إجراءات سريعة</h5>
              </Card.Header>
              <Card.Body>
                <Button 
                  variant="outline-primary" 
                  className="w-100 mb-2"
                  onClick={loadAllActivities}
                >
                  🔄 تحديث القائمة
                </Button>
                <Button 
                  variant="outline-info" 
                  className="w-100 mb-2"
                  onClick={handleCreateNew}
                >
                  📝 نشاط سريع
                </Button>
                <Button 
                  variant="outline-secondary" 
                  className="w-100"
                  onClick={() => navigate('/admin')}
                >
                  👥 إدارة المستخدمين
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Contenu principal */}
          <Col md={9}>
            <Card className="admin-activities-card">
              <Card.Header className="admin-content-header">
                <div className="content-info">
                  <h4 className="mb-1">جميع الأنشطة في النظام</h4>
                  <p className="text-muted mb-0">
                    كمسؤول، يمكنك عرض، تعديل، وحذف أي نشاط في النظام
                  </p>
                </div>
                <Badge bg="primary" className="activities-count-badge">
                  {activity.activities?.length || 0} نشاط
                </Badge>
              </Card.Header>

              <Card.Body>
                {/* Alertes */}
                {activity.errors && activity.errors.length > 0 && (
                  <Alert variant="danger" className="mb-3">
                    <ul className="mb-0">
                      {activity.errors.map((error, index) => (
                        <li key={index}>{error.msg || error}</li>
                      ))}
                    </ul>
                  </Alert>
                )}

                {activity.success && activity.success.length > 0 && (
                  <Alert variant="success" className="mb-3">
                    {Array.isArray(activity.success) ? activity.success.join(', ') : activity.success}
                  </Alert>
                )}

                {/* Liste des activités */}
                {activity.loadActivity && !activity.activities?.length ? (
                  <div className="loading-state text-center py-5">
                    <div className="loading-spinner"></div>
                    <p className="loading-text mt-3">جاري تحميل الأنشطة...</p>
                  </div>
                ) : !activity.activities?.length ? (
                  <div className="empty-state text-center py-5">
                    <div className="empty-icon" style={{fontSize: '4rem'}}>📝</div>
                    <h3 className="empty-title mt-3">لا توجد أنشطة في النظام</h3>
                    <p className="empty-description text-muted">
                      ابدأ بإضافة أول نشاط إلى النظام
                    </p>
                    <Button 
                      variant="primary" 
                      onClick={handleCreateNew}
                      className="mt-3"
                    >
                      إضافة أول نشاط
                    </Button>
                  </div>
                ) : (
                  <div className="activities-list">
                    {activity.activities.map(activityItem => (
                      <div key={activityItem._id} className="activity-item-admin mb-3">
                        <ActivityCard 
                          activity={activityItem}
                          isUserIdentified={false}
                          onEdit={handleEditActivity}
                          isAdminView={true}
                          onDelete={handleDeleteActivity}
                          showAdminControls={true}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {activity.pagination && currentPage < activity.pagination.pages && (
                  <div className="text-center mt-4">
                    <Button 
                      variant="outline-primary" 
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={activity.loadActivity}
                    >
                      {activity.loadActivity ? 'جاري التحميل...' : 'تحميل المزيد'}
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal de formulaire */}
      <ActivityForm 
        show={showForm}
        onHide={handleCloseForm}
        activityToEdit={editingActivity}
        isAdmin={true}
      />
    </div>
  )
}

export default AdminActivities