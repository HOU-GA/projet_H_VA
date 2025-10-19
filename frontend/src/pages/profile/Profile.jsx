
import React, { useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { current } from '../../JS/actions/AuthAction' // ✅ Utiliser l'action 'current' disponible
import UserEditProfile from '../../components/edtitProfileUser/UserEditProfile'
import './Profile.css'

const Profile = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
    
  // ✅ Utiliser le state d'auth pour l'utilisateur connecté
  const { user, loading: authLoading, errors: authErrors } = useSelector(state => state.authReducer)
  
  // Récupère l'utilisateur connecté
  const currentUser = useSelector(state => state.authReducer.user)

  useEffect(() => {
    // ✅ Charger les données de l'utilisateur connecté avec l'action 'current'
    dispatch(current())
  }, [dispatch])

  const handleBack = () => {
    navigate(-1) // Retour à la page précédente
  }

  // ✅ Fonction de rafraîchissement après modification
  const handleUpdateSuccess = () => {
    // Recharger les données utilisateur après modification
    dispatch(current())
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد'
    try {
      return new Date(dateString).toLocaleDateString('ar-EG')
    } catch (error) {
      return 'غير محدد'
    }
  }

  const displayValue = (value) => {
    return value || 'غير محدد'
  }

  // ✅ Gérer le loading
  if (authLoading) {
    return (
      <Container className="profile-container">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">جاري تحميل الملف الشخصي...</p>
        </div>
      </Container>
    )
  }

  // ✅ Gérer les erreurs
  if (authErrors && authErrors.length > 0) {
    const errorMessage = typeof authErrors === 'string' ? authErrors : 
                        authErrors.message || 'حدث خطأ غير معروف';
    
    return (
      <Container className="profile-container">
        <Alert variant="danger" className="bg-light text-dark border-danger">
          <h4 className="text-danger fw-bold">خطأ في تحميل البيانات</h4>
          <p className="text-dark mb-3">{errorMessage}</p>
          <Button 
            variant="outline-danger" 
            onClick={handleBack} 
            className="custom-back-btn"
          >
            العودة
          </Button>
        </Alert>
      </Container>
    )
  }

  if (!user) {
    return (
      <Container className="profile-container">
        <Alert variant="warning">
          <h4>الرجاء تسجيل الدخول</h4>
          <p>يجب تسجيل الدخول لعرض الملف الشخصي</p>
          <Button variant="secondary" onClick={() => navigate('/login')}>
            تسجيل الدخول
          </Button>
        </Alert>
      </Container>
    )
  }

  return (
    <Container className="profile-container">
      {/* En-tête utilisateur */}
      <div className="user-header mb-3">
        <Row className="align-items-center">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <Button 
                  variant="outline-secondary" 
                  onClick={handleBack}
                  className="me-3 custom-back-button"
                >
                  ← العودة الى الصفحة الرئيسية
                </Button>
              </div>
              <div className="text-center">
                <h4 className="mb-0">ملفي الشخصي</h4>
                <small className="text-muted">
                  المستخدم: {currentUser?.name} | {currentUser?.role === 'user' ? 'مستخدم' : 'مسؤول'}
                </small>
              </div>
              <div>
                {/* ✅ BOUTON MODIFICATION: Pour l'utilisateur */}
                {currentUser?.role === 'user' && (
                  <UserEditProfile 
                    user={user} 
                    onUpdate={handleUpdateSuccess}
                    buttonText="✏️ تعديل الملف"
                    buttonVariant="warning"
                  />
                )}
                <Badge bg="success" className="user-badge ms-2">
                  وضع المستخدم
                </Badge>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <Row className="justify-content-center">
        <Col lg={12}>
          <Card className="profile-card">
            <Card.Header className="profile-header">
              <div className="header-content">
                <h2 className="profile-title">الملف الشخصي - {user.name}</h2>
                <p className="profile-subtitle">Minerva Link - نظام إدارة الموارد البشرية</p>
              </div>
              <div>
                <Button 
                  variant="outline-light" 
                  className="print-btn me-2"
                  onClick={() => window.print()}
                >
                  🖨️ طباعة الملف
                </Button>
                <Badge bg={user.role === 'admin' ? 'danger' : 'success'} className="role-badge">
                  {user.role === 'admin' ? 'مسؤول' : 'مستخدم'}
                </Badge>
              </div>
            </Card.Header>

            <Card.Body className="profile-body">
              {/* Section 1: المعلومات الأساسية */}
              <div className="profile-section main-info-section">
                <Row className="align-items-center">
                  <Col md={3} className="text-center">
                    <div className="profile-picture-container">
                      {user.profile_picture ? (
                        <img 
                          src={user.profile_picture} 
                          alt="صورة المستخدم" 
                          className="profile-picture"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <div className="profile-picture-placeholder" style={{display: user.profile_picture ? 'none' : 'block'}}>
                        <span className="placeholder-text">لا توجد صورة</span>
                      </div>
                    </div>
                    <Badge bg={user.isAuth ? 'success' : 'secondary'} className="status-badge mt-2">
                      {user.isAuth ? 'مفعل' : 'غير مفعل'}
                    </Badge>
                  </Col>
                  <Col md={9}>
                    <div className="info-grid">
                      <div className="info-line">
                        <span className="info-label">الاسم واللقب:</span>
                        <span className="info-value">{displayValue(user.name)}</span>
                      </div>
                      <div className="info-line">
                        <span className="info-label">البريد الإلكتروني:</span>
                        <span className="info-value">{displayValue(user.email_address || user.email)}</span>
                      </div>
                      <div className="info-line">
                        <span className="info-label">الجنس:</span>
                        <span className="info-value">{displayValue(user.gender)}</span>
                      </div>
                      <div className="info-line">
                        <span className="info-label">العمر:</span>
                        <span className="info-value">{displayValue(user.age)}</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Section 8: أرقام الهاتف */}
              <div className="profile-section">
                <h4 className="section-title">أرقام الهاتف</h4>
                {user.phone_numbers && user.phone_numbers.length > 0 && user.phone_numbers.some(phone => phone.number) ? (
                  <div className="info-grid">
                    {user.phone_numbers.map((phone, index) => (
                      phone.number && (
                        <div key={index} className="info-line">
                          <span className="info-label">رقم الهاتف {index + 1}:</span>
                          <span className="info-value">{phone.number}</span>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <div className="no-data">لا توجد أرقام هاتف مسجلة</div>
                )}
              </div>

              {/* Section 2: معلومات الهوية */}
              <div className="profile-section">
                <h4 className="section-title">معلومات الهوية</h4>
                <div className="info-grid">
                  <div className="info-line">
                    <span className="info-label">رقم بطاقة التعريف الوطنية:</span>
                    <span className="info-value">{displayValue(user.id_card_number)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">تاريخ اصدار البطاقة:</span>
                    <span className="info-value">{formatDate(user.id_card_issue_date)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">رقم جواز السفر:</span>
                    <span className="info-value">{displayValue(user.passport_number)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">تاريخ اصدار الجواز:</span>
                    <span className="info-value">{formatDate(user.passport_date)}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: الأرقام الرسمية */}
              <div className="profile-section">
                <h4 className="section-title">الأرقام الرسمية</h4>
                <div className="info-grid">
                  <div className="info-line">
                    <span className="info-label">الرقم الشخصي:</span>
                    <span className="info-value highlight">{displayValue(user.id_number)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">رقم التعاونية:</span>
                    <span className="info-value">{displayValue(user.cooperative_number)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">الرقم الموحد:</span>
                    <span className="info-value">{displayValue(user.unique_id)}</span>
                  </div>
                </div>
              </div>

              {/* Section 4: المعلومات الشخصية */}
              <div className="profile-section">
                <h4 className="section-title">المعلومات الشخصية</h4>
                <div className="info-grid">
                  <div className="info-line">
                    <span className="info-label">تاريخ الولادة:</span>
                    <span className="info-value">{formatDate(user.date_of_birth)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">الحالة الصحية:</span>
                    <span className="info-value">{displayValue(user.health_status)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">مكان الولادة (الولاية):</span>
                    <span className="info-value">{displayValue(user.place_of_birth_by_state)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">مكان الولادة (المعتمدية):</span>
                    <span className="info-value">{displayValue(user.place_of_birth_by_delegation)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">مسقط الرأس (الولاية):</span>
                    <span className="info-value">{displayValue(user.place_of_origin_by_state)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">مسقط الرأس (المعتمدية):</span>
                    <span className="info-value">{displayValue(user.place_of_origin_by_delegation)}</span>
                  </div>
                </div>
              </div>

              {/* Section 5: المعلومات الوظيفية */}
              <div className="profile-section">
                <h4 className="section-title">المعلومات الوظيفية</h4>
                <div className="info-grid">
                  <div className="info-line">
                    <span className="info-label">الرتبة:</span>
                    <span className="info-value highlight">{displayValue(user.grade)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">الخطة الوظيفية الحالية:</span>
                    <span className="info-value">{displayValue(user.current_career_plan)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">تاريخ الحصول على الرتبة:</span>
                    <span className="info-value">{formatDate(user.grade_obtainment_date)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">تاريخ التعيين بالخطة الحالية:</span>
                    <span className="info-value">{formatDate(user.current_plan_start_date)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">الأقدمية في الخطة الحالية:</span>
                    <span className="info-value">{displayValue(user.current_plan_seniority)} سنة</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">تاريخ الحصول على الخطة الوظيفية:</span>
                    <span className="info-value">{formatDate(user.career_plan_obtainment_date)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">الأقدمية في الخطة الوظيفية:</span>
                    <span className="info-value">{displayValue(user.career_plan_seniority)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">الأقدمية في الرتبة:</span>
                    <span className="info-value">{displayValue(user.rank_seniority)} سنة</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">تاريخ الانتداب:</span>
                    <span className="info-value">{formatDate(user.appointment_date)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">الأقدمية المهنية:</span>
                    <span className="info-value">{displayValue(user.professional_seniority)} سنة</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">تاريخ التقاعد:</span>
                    <span className="info-value">{formatDate(user.retirement_date)}</span>
                  </div>
                </div>
              </div>

              {/* Section 6: المعلومات العائلية */}
              <div className="profile-section">
                <h4 className="section-title">المعلومات العائلية</h4>
                <div className="info-grid">
                  <div className="info-line">
                    <span className="info-label">الحالة العائلية:</span>
                    <span className="info-value">{displayValue(user.family_status)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">عدد الأطفال:</span>
                    <span className="info-value">{displayValue(user.children_count)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">عنوان إقامة العائلة:</span>
                    <span className="info-value">{displayValue(user.family_address)}</span>
                  </div>
                </div>
              </div>

              {/* Section 7: معلومات القرين */}
              <div className="profile-section">
                <h4 className="section-title">معلومات القرين</h4>
                <div className="info-grid">
                  <div className="info-line">
                    <span className="info-label">الوضعية المهنية للقرين:</span>
                    <span className="info-value">{displayValue(user.spouse_employment_status)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">المهنة ومكان العمل:</span>
                    <span className="info-value">{displayValue(user.spouse_occupation_and_workplace)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">مكان ولادة القرين:</span>
                    <span className="info-value">{displayValue(user.spouse_birth_place)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">مسقط رأس القرين (الولاية):</span>
                    <span className="info-value">{displayValue(user.spouse_place_of_origin_by_state)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">مسقط رأس القرين (المعتمدية):</span>
                    <span className="info-value">{displayValue(user.spouse_place_of_origin_by_delegation)}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">الحالة الصحية للقرين:</span>
                    <span className="info-value">{displayValue(user.spouse_health_status)}</span>
                  </div>
                </div>
              </div>

              {/* Section 9: معلومات الأطفال */}
              <div className="profile-section">
                <h4 className="section-title">معلومات الأطفال</h4>
                {user.children && user.children.length > 0 && user.children.some(child => child.children_names) ? (
                  user.children.map((child, index) => (
                    child.children_names && (
                      <div key={index} className="child-section">
                        <h6 className="child-title">الطفل {index + 1}</h6>
                        <div className="info-grid">
                          <div className="info-line">
                            <span className="info-label">الاسم:</span>
                            <span className="info-value">{child.children_names}</span>
                          </div>
                          <div className="info-line">
                            <span className="info-label">تاريخ الولادة:</span>
                            <span className="info-value">{formatDate(child.children_birth_dates)}</span>
                          </div>
                          <div className="info-line">
                            <span className="info-label">الحالة الصحية:</span>
                            <span className="info-value">{displayValue(child.children_health_status)}</span>
                          </div>
                          <div className="info-line">
                            <span className="info-label">الوضعية العائلية:</span>
                            <span className="info-value">{displayValue(child.children_status)}</span>
                          </div>
                          <div className="info-line">
                            <span className="info-label">مكان الدراسة/العمل:</span>
                            <span className="info-value">{displayValue(child.children_education_work_places)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  ))
                ) : (
                  <div className="no-data">لا توجد معلومات عن الأطفال</div>
                )}
              </div>

              {/* Section 10: المسار المهني */}
              <div className="profile-section">
                <h4 className="section-title">المسار المهني</h4>
                {user.assigned_career_plans && user.assigned_career_plans.length > 0 && user.assigned_career_plans.some(plan => plan.career_plan) ? (
                  user.assigned_career_plans.map((plan, index) => (
                    plan.career_plan && (
                      <div key={index} className="career-section">
                        <h6 className="career-title">الخطة الوظيفية {index + 1}</h6>
                        <div className="info-grid">
                          <div className="info-line">
                            <span className="info-label">الخطة الوظيفية:</span>
                            <span className="info-value">{plan.career_plan}</span>
                          </div>
                          <div className="info-line">
                            <span className="info-label">تاريخ المباشرة:</span>
                            <span className="info-value">{formatDate(plan.career_plan_start_date)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  ))
                ) : (
                  <div className="no-data">لا توجد خطط وظيفية سابقة</div>
                )}
              </div>

              {/* Section 11: ملاحظات عامة */}
              <div className="profile-section">
                <h4 className="section-title">ملاحظات عامة</h4>
                {user.general_notes ? (
                  <div className="notes-section">
                    <p className="notes-text">{user.general_notes}</p>
                  </div>
                ) : (
                  <div className="no-data">لا توجد ملاحظات عامة</div>
                )}
              </div>
            </Card.Body>

            <Card.Footer className="profile-footer">
              <div className="footer-content">
                <span className="footer-text">
                  Minerva Link - نظام إدارة الموارد البشرية © {new Date().getFullYear()}
                </span>
                <span className="print-date">
                  تم الإنشاء في: {new Date().toLocaleDateString('ar-EG')}
                </span>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Profile