/*import React, { useState, useEffect } from 'react'
import { Button, Form, Container, Row, Col, Card, Alert } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { register } from '../../JS/actions/AuthAction'
import './Register.css'

const Register = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const auth = useSelector(state => state.authReducer)

  const [newUser, setNewUser] = useState({
    // Informations de connexion
    email_address: "",
    password: "",
    
    // Informations personnelles
    name: "",
    gender: "",
    profile_picture: "",
    
    // Informations d'identification
    id_card_number: "",
    id_card_issue_date: "",
    passport_number: "",
    passport_date: "",
    
    // Numéros officiels
    id_number: "",
    cooperative_number: "",
    unique_id: "",
    
    // Informations professionnelles
    current_career_plan: "",
    current_plan_start_date: "",
    current_plan_seniority: "",
    career_plan_obtainment_date: "",
    career_plan_seniority: "",
    grade: "",
    grade_obtainment_date: "",
    rank_seniority: "",
    appointment_date: "",
    professional_seniority: "",
    retirement_date: "",
    
    // Informations personnelles détaillées
    date_of_birth: "",
    age: "",
    health_status: "",
    place_of_birth_by_state: "",
    place_of_birth_by_delegation: "",
    place_of_origin_by_state: "",
    place_of_origin_by_delegation: "",
    
    // Informations familiales
    family_address: "",
    family_status: "",
    children_count: "",
    
    // Informations du conjoint
    spouse_employment_status: "",
    spouse_occupation_and_workplace: "",
    spouse_birth_place: "",
    spouse_place_of_origin_by_state: "",
    spouse_place_of_origin_by_delegation: "",
    spouse_health_status: "",
    
    // Notes générales
    general_notes: ""
  })

  // États séparés pour les tableaux
  const [phoneNumbers, setPhoneNumbers] = useState([{ number: "" }])
  const [children, setChildren] = useState([{
    children_names: '',
    children_birth_dates: '',
    children_status: '',
    children_education_work_places: '',
    children_health_status: ''
  }])
  const [assignedCareerPlans, setAssignedCareerPlans] = useState([{
    career_plan: '',
    career_plan_start_date: ''
  }])

  // Redirection après inscription réussie
  useEffect(() => {
    if (auth.isAuth) {
      navigate("/profile")
    }
  }, [auth.isAuth, navigate])

  const handleChange = (e) => {
    setNewUser({...newUser, [e.target.name]: e.target.value})
  }

  // Fonction de soumission
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Préparer les données pour l'envoi
    const userData = {
      ...newUser,
      phone_numbers: phoneNumbers.filter(phone => phone.number.trim() !== ''),
      children: children.filter(child => child.children_names.trim() !== ''),
      assigned_career_plans: assignedCareerPlans.filter(plan => plan.career_plan.trim() !== '')
    }
    
    console.log('Données envoyées:', userData)
    dispatch(register(userData))
  }

  // Fonctions pour les numéros de téléphone
  const addPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, { number: "" }])
  }

  const updatePhoneNumber = (index, value) => {
    const newPhoneNumbers = [...phoneNumbers]
    newPhoneNumbers[index].number = value
    setPhoneNumbers(newPhoneNumbers)
  }

  const removePhoneNumber = (index) => {
    if (phoneNumbers.length > 1) {
      const newPhoneNumbers = phoneNumbers.filter((_, i) => i !== index)
      setPhoneNumbers(newPhoneNumbers)
    }
  }

  // Fonctions pour les enfants
  const addChild = () => {
    setChildren([...children, {
      children_names: '',
      children_birth_dates: '',
      children_status: '',
      children_education_work_places: '',
      children_health_status: ''
    }])
  }

  const updateChild = (index, field, value) => {
    const newChildren = [...children]
    newChildren[index][field] = value
    setChildren(newChildren)
  }

  const removeChild = (index) => {
    if (children.length > 1) {
      const newChildren = children.filter((_, i) => i !== index)
      setChildren(newChildren)
    }
  }

  // Fonctions pour les plans de carrière
  const addCareerPlan = () => {
    setAssignedCareerPlans([...assignedCareerPlans, {
      career_plan: '',
      career_plan_start_date: ''
    }])
  }

  const updateCareerPlan = (index, field, value) => {
    const newCareerPlans = [...assignedCareerPlans]
    newCareerPlans[index][field] = value
    setAssignedCareerPlans(newCareerPlans)
  }

  const removeCareerPlan = (index) => {
    if (assignedCareerPlans.length > 1) {
      const newCareerPlans = assignedCareerPlans.filter((_, i) => i !== index)
      setAssignedCareerPlans(newCareerPlans)
    }
  }

  return (
    <Container className="register-container">
      <Row className="justify-content-center">
        <Col lg={12}>
          <Card className="register-card">
            <Card.Header className="register-header">
              <h2 className="register-title">Minerva Link</h2>
              <p className="register-subtitle">نموذج التسجيل</p>
            </Card.Header>
            <Card.Body>
              {/* Alertes pour les erreurs/succès *//*}
              {auth.errors && auth.errors.length > 0 && (
                <Alert variant="danger" className="mb-4">
                  <ul className="mb-0">
                    {auth.errors.map((error, index) => (
                      <li key={index}>{error.msg || error}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              {auth.success && auth.success.length > 0 && (
                <Alert variant="success" className="mb-4">
                  {Array.isArray(auth.success) ? auth.success.join(', ') : auth.success}
                </Alert>
              )}

              <Form className="register-form" onSubmit={handleSubmit}>
                
                {/* Section 1: معلومات الاتصال *//*}
                <div className="form-section">
                  <h4 className="section-title">معلومات الاتصال</h4>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>البريد الالكتروني *</Form.Label>
                        <Form.Control 
                          type="email" 
                          placeholder="البريد الالكتروني" 
                          className="form-input"
                          name="email_address" 
                          value={newUser.email_address} 
                          onChange={handleChange}
                          required 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الرقم السري للولوج الى التطبيقة *</Form.Label>
                        <Form.Control 
                          type="password" 
                          placeholder="الرقم السري" 
                          className="form-input"
                          name="password"
                          value={newUser.password}
                          onChange={handleChange}
                          required 
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 2: المعلومات الشخصية *//*}
                <div className="form-section">
                  <h4 className="section-title">المعطيات الشخصية</h4>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الاسم واللقب *</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="الاسم واللقب" 
                          className="form-input" 
                          name="name"
                          value={newUser.name}
                          onChange={handleChange}
                          required 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الجنس *</Form.Label>
                        <Form.Select 
                          className="form-input" 
                          name="gender"
                          value={newUser.gender}
                          onChange={handleChange}
                          required
                        >
                          <option value="">اختر الجنس</option>
                          <option value="ذكر">ذكر</option>
                          <option value="أنثى">أنثى</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>صورة المستخدم</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="صورة المستخدم" 
                          className="form-input" 
                          name="profile_picture"
                          value={newUser.profile_picture}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 3: أرقام الهاتف *//*}
                <div className="form-section">
                  <h4 className="section-title">أرقام الهاتف الخاصة بالمستخدم</h4>
                  
                  <div className="mb-3 text-left">
                    <Button 
                      variant="outline-success" 
                      onClick={addPhoneNumber}
                      className="add-phone-btn"
                      size="sm"
                      type="button"
                    >
                      + إضافة رقم هاتف
                    </Button>
                  </div>

                  {phoneNumbers.map((phone, index) => (
                    <Row key={index} className="phone-number-row align-items-center mb-2">
                      <Col md={10}>
                        <Form.Group className="form-group-custom">
                          <Form.Label>
                            رقم الهاتف {phoneNumbers.length > 1 ? `#${index + 1}` : ''}
                          </Form.Label>
                          <Form.Control 
                            type="tel" 
                            placeholder="أدخل رقم الهاتف" 
                            className="form-input"
                            value={phone.number}
                            onChange={(e) => updatePhoneNumber(index, e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        {phoneNumbers.length > 1 && (
                          <Button 
                            variant="outline-danger" 
                            onClick={() => removePhoneNumber(index)}
                            className="remove-phone-btn mt-4"
                            size="sm"
                            type="button"
                          >
                            ✕
                          </Button>
                        )}
                      </Col>
                    </Row>
                  ))}
                </div>

                {/* Section 4: بطاقة التعريف الوطنية *//*}
                <div className="form-section">
                  <h4 className="section-title">بطاقة التعريف الوطنية</h4>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>رقم بطاقة التعريف الوطنية</Form.Label>
                        <Form.Control 
                          type="number" 
                          placeholder="رقم بطاقة التعريف الوطنية" 
                          className="form-input" 
                          name="id_card_number"
                          value={newUser.id_card_number}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>تاريخ اصدار بطاقة التعريف الوطنية</Form.Label>
                        <Form.Control 
                          type="date" 
                          className="form-input" 
                          name="id_card_issue_date"
                          value={newUser.id_card_issue_date}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 5: جواز السفر *//*}
                <div className="form-section">
                  <h4 className="section-title">جواز السفر</h4>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>رقم جواز السفر</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="رقم جواز السفر" 
                          className="form-input" 
                          name="passport_number"
                          value={newUser.passport_number}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>تاريخ اصدار جواز السفر</Form.Label>
                        <Form.Control 
                          type="date" 
                          className="form-input" 
                          name="passport_date"
                          value={newUser.passport_date}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 6: الأرقام الرسمية *//*}
                <div className="form-section">
                  <h4 className="section-title">الأرقام المهنية</h4>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الرقم الشخصي *</Form.Label>
                        <Form.Control 
                          type="number" 
                          placeholder="الرقم الشخصي" 
                          className="form-input" 
                          name="id_number"
                          value={newUser.id_number}
                          onChange={handleChange}
                          required 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>رقم التعاونية</Form.Label>
                        <Form.Control 
                          type="number" 
                          placeholder="رقم التعاونية" 
                          className="form-input" 
                          name="cooperative_number"
                          value={newUser.cooperative_number}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الرقم الموحد</Form.Label>
                        <Form.Control 
                          type="number" 
                          placeholder="الرقم الموحد" 
                          className="form-input" 
                          name="unique_id"
                          value={newUser.unique_id}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 7: المعلومات الوظيفية *//*}
                <div className="form-section">
                  <h4 className="section-title">المعلومات الوظيفية</h4>
                  
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الخطة الوظيفية الحالية</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="الخطة الوظيفية الحالية" 
                          className="form-input" 
                          name="current_career_plan"
                          value={newUser.current_career_plan}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>تاريخ التعيين بالخطة الحالية</Form.Label>
                        <Form.Control 
                          type="date" 
                          className="form-input" 
                          name="current_plan_start_date"
                          value={newUser.current_plan_start_date}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الاقدمية في الخطة الحالية</Form.Label>
                        <Form.Control 
                          type="number" 
                          placeholder="الاقدمية في الخطة الحالية" 
                          className="form-input" 
                          name="current_plan_seniority"
                          value={newUser.current_plan_seniority}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>تاريخ الحصول على الخطة الوظيفية</Form.Label>
                        <Form.Control 
                          type="date" 
                          className="form-input" 
                          name="career_plan_obtainment_date"
                          value={newUser.career_plan_obtainment_date}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الاقدمية في الخطة الوظيفية</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="الاقدمية في الخطة الوظيفية" 
                          className="form-input" 
                          name="career_plan_seniority"
                          value={newUser.career_plan_seniority}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الرتبة *</Form.Label>
                        <Form.Select 
                          className="form-input" 
                          name="grade"
                          value={newUser.grade}
                          onChange={handleChange}
                          required
                        >
                          <option value="">اختر الرتبة</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="E">E</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>تاريخ الحصول على الرتبة</Form.Label>
                        <Form.Control 
                          type="date" 
                          className="form-input" 
                          name="grade_obtainment_date"
                          value={newUser.grade_obtainment_date}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الاقدمية في الرتبة</Form.Label>
                        <Form.Control 
                          type="number" 
                          placeholder="الاقدمية في الرتبة" 
                          className="form-input" 
                          name="rank_seniority"
                          value={newUser.rank_seniority}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>تاريخ الانتداب</Form.Label>
                        <Form.Control 
                          type="date" 
                          className="form-input" 
                          name="appointment_date"
                          value={newUser.appointment_date}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الاقدمية المهنية</Form.Label>
                        <Form.Control 
                          type="number" 
                          placeholder="الاقدمية المهنية" 
                          className="form-input" 
                          name="professional_seniority"
                          value={newUser.professional_seniority}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>تاريخ التقاعد</Form.Label>
                        <Form.Control 
                          type="date" 
                          className="form-input" 
                          name="retirement_date"
                          value={newUser.retirement_date}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 8: المعلومات الشخصية التفصيلية *//*}
                <div className="form-section">
                  <h4 className="section-title">المعلومات الشخصية التفصيلية</h4>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>تاريخ الولادة</Form.Label>
                        <Form.Control 
                          type="date" 
                          className="form-input" 
                          name="date_of_birth"
                          value={newUser.date_of_birth}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>العمر</Form.Label>
                        <Form.Control 
                          type="number" 
                          placeholder="العمر" 
                          className="form-input" 
                          name="age"
                          value={newUser.age}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الحالة الصحية للمستخدم</Form.Label>
                        <Form.Select 
                          className="form-input" 
                          name="health_status"
                          value={newUser.health_status}
                          onChange={handleChange}
                        >
                          <option value="">اختر الحالة الصحية</option>
                          <option value="صحة ممتازة بدون أي مشاكل">صحة ممتازة بدون أي مشاكل</option>
                          <option value="صحة جيدة بدون أمراض مزمنة">صحة جيدة بدون أمراض مزمنة</option>
                          <option value="مقبول - بعض المشاكل الصحية العادية">مقبول - بعض المشاكل الصحية العادية</option>
                          <option value="يحتاج متابعة - أمراض تحت المراقبة">يحتاج متابعة - أمراض تحت المراقبة</option>
                          <option value="مزمن - أمراض مزمنة مستقرة">مزمن - أمراض مزمنة مستقرة</option>
                          <option value="خاص - حالات صحية خاصة">خاص - حالات صحية خاصة</option>
                          <option value="إعاقة - شخص من ذوي الاعاقة">إعاقة - شخص من ذوي الاعاقة</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>مكان الولادة حسب الولاية</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="مكان الولادة حسب الولاية" 
                          className="form-input" 
                          name="place_of_birth_by_state"
                          value={newUser.place_of_birth_by_state}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>مكان الولادة حسب المعتمدية</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="مكان الولادة حسب المعتمدية" 
                          className="form-input" 
                          name="place_of_birth_by_delegation"
                          value={newUser.place_of_birth_by_delegation}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>مسقط الرأس حسب الولاية</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="مسقط الرأس حسب الولاية" 
                          className="form-input" 
                          name="place_of_origin_by_state"
                          value={newUser.place_of_origin_by_state}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>مسقط الرأس حسب المعتمدية</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="مسقط الرأس حسب المعتمدية" 
                          className="form-input" 
                          name="place_of_origin_by_delegation"
                          value={newUser.place_of_origin_by_delegation}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 9: المعلومات العائلية *//*}
                <div className="form-section">
                  <h4 className="section-title">المعلومات العائلية</h4>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>عنوان اقامة العائلة</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="عنوان اقامة العائلة" 
                          className="form-input" 
                          name="family_address"
                          value={newUser.family_address}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الحالة العائلية</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="الحالة العائلية" 
                          className="form-input" 
                          name="family_status"
                          value={newUser.family_status}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>عدد الأطفال</Form.Label>
                        <Form.Control 
                          type="number" 
                          placeholder="عدد الاطفال" 
                          className="form-input" 
                          name="children_count"
                          value={newUser.children_count}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 10: معلومات القرين *//*}
                <div className="form-section">
                  <h4 className="section-title">معلومات القرين</h4>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الوضعية المهنية للقرين</Form.Label>
                        <Form.Select 
                          className="form-input" 
                          name="spouse_employment_status"
                          value={newUser.spouse_employment_status}
                          onChange={handleChange}
                        >
                          <option value="">اختر الوضعية المهنية</option>
                          <option value="قطاع عام">قطاع عام</option>
                          <option value="قطاع خاص">قطاع خاص</option>
                          <option value="مهن حرة">مهن حرة</option>
                          <option value="طالب">طالب</option>
                          <option value="عاطل عن العمل">عاطل عن العمل</option>
                          <option value="لا يعمل">لا يعمل</option>
                          <option value="متقاعد">متقاعد</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>مهنة القرين ومكان عمله</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="مهنة القرين ومكان عمله" 
                          className="form-input" 
                          name="spouse_occupation_and_workplace"
                          value={newUser.spouse_occupation_and_workplace}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>مكان ولادة القرين</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="مكان ولادة القرين" 
                          className="form-input" 
                          name="spouse_birth_place"
                          value={newUser.spouse_birth_place}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>مسقط رأس القرين حسب الولاية</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="مسقط رأس القرين حسب الولاية" 
                          className="form-input" 
                          name="spouse_place_of_origin_by_state"
                          value={newUser.spouse_place_of_origin_by_state}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>مسقط رأس القرين حسب المعتمدية</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="مسقط رأس القرين حسب المعتمدية" 
                          className="form-input" 
                          name="spouse_place_of_origin_by_delegation"
                          value={newUser.spouse_place_of_origin_by_delegation}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الحالة الصحية للقرين</Form.Label>
                        <Form.Select 
                          className="form-input" 
                          name="spouse_health_status"
                          value={newUser.spouse_health_status}
                          onChange={handleChange}
                        >
                          <option value="">اختر الحالة الصحية</option>
                          <option value="صحة ممتازة بدون أي مشاكل">صحة ممتازة بدون أي مشاكل</option>
                          <option value="صحة جيدة بدون أمراض مزمنة">صحة جيدة بدون أمراض مزمنة</option>
                          <option value="مقبول - بعض المشاكل الصحية العادية">مقبول - بعض المشاكل الصحية العادية</option>
                          <option value="يحتاج متابعة - أمراض تحت المراقبة">يحتاج متابعة - أمراض تحت المراقبة</option>
                          <option value="مزمن - أمراض مزمنة مستقرة">مزمن - أمراض مزمنة مستقرة</option>
                          <option value="خاص - حالات صحية خاصة">خاص - حالات صحية خاصة</option>
                          <option value="إعاقة - شخص من ذوي الاعاقة">إعاقة - شخص من ذوي الاعاقة</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 11: معلومات الأطفال *//*}
                <div className="form-section">
                  <h4 className="section-title">معلومات الأطفال</h4>
                  
                  <div className="mb-3 text-left">
                    <Button 
                      variant="outline-info" 
                      onClick={addChild}
                      className="add-btn"
                      size="sm"
                      type="button"
                    >
                      + إضافة طفل
                    </Button>
                  </div>

                  {children.map((child, index) => (
                    <div key={`child-${index}`} className="child-section mb-4 p-3 border rounded">
                      <Row className="align-items-center mb-2">
                        <Col md={10}>
                          <h6 className="child-title">
                            الطفل {children.length > 1 ? `#${index + 1}` : ''}
                          </h6>
                        </Col>
                        <Col md={2}>
                          {children.length > 1 && (
                            <Button 
                              variant="outline-danger" 
                              onClick={() => removeChild(index)}
                              className="remove-btn"
                              size="sm"
                              type="button"
                            >
                              ✕ حذف
                            </Button>
                          )}
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3 form-group-custom">
                            <Form.Label>اسم الطفل</Form.Label>
                            <Form.Control 
                              type="text" 
                              placeholder="اسم الطفل" 
                              className="form-input"
                              value={child.children_names}
                              onChange={(e) => updateChild(index, 'children_names', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3 form-group-custom">
                            <Form.Label>تاريخ ولادة الطفل</Form.Label>
                            <Form.Control 
                              type="date" 
                              className="form-input"
                              value={child.children_birth_dates}
                              onChange={(e) => updateChild(index, 'children_birth_dates', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3 form-group-custom">
                            <Form.Label>الوضعية العائلية للطفل</Form.Label>
                            <Form.Control 
                              type="text" 
                              placeholder="الوضعية العائلية للطفل" 
                              className="form-input"
                              value={child.children_status}
                              onChange={(e) => updateChild(index, 'children_status', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3 form-group-custom">
                            <Form.Label>مكان دراسة او عمل الطفل</Form.Label>
                            <Form.Control 
                              type="text" 
                              placeholder="مكان دراسة او عمل الطفل" 
                              className="form-input"
                              value={child.children_education_work_places}
                              onChange={(e) => updateChild(index, 'children_education_work_places', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={12}>
                          <Form.Group className="mb-3 form-group-custom">
                            <Form.Label>الحالة الصحية للطفل</Form.Label>
                            <Form.Select 
                              className="form-input"
                              value={child.children_health_status}
                              onChange={(e) => updateChild(index, 'children_health_status', e.target.value)}
                            >
                              <option value="">اختر الحالة الصحية</option>
                              <option value="صحة ممتازة بدون أي مشاكل">صحة ممتازة بدون أي مشاكل</option>
                              <option value="صحة جيدة بدون أمراض مزمنة">صحة جيدة بدون أمراض مزمنة</option>
                              <option value="مقبول - بعض المشاكل الصحية العادية">مقبول - بعض المشاكل الصحية العادية</option>
                              <option value="يحتاج متابعة - أمراض تحت المراقبة">يحتاج متابعة - أمراض تحت المراقبة</option>
                              <option value="مزمن - أمراض مزمنة مستقرة">مزمن - أمراض مزمنة مستقرة</option>
                              <option value="خاص - حالات صحية خاصة">خاص - حالات صحية خاصة</option>
                              <option value="إعاقة - شخص من ذوي الاعاقة">إعاقة - شخص من ذوي الاعاقة</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>

                {/* Section 12: الخطط الوظيفية السابقة *//*}
                <div className="form-section">
                  <h4 className="section-title">المسار المهني</h4>
                  
                  <div className="mb-3 text-left">
                    <Button 
                      variant="outline-warning" 
                      onClick={addCareerPlan}
                      className="add-btn"
                      size="sm"
                      type="button"
                    >
                      + إضافة خطة وظيفية
                    </Button>
                  </div>

                  {assignedCareerPlans.map((careerPlan, index) => (
                    <div key={`career-${index}`} className="career-section mb-4 p-3 border rounded">
                      <Row className="align-items-center mb-2">
                        <Col md={10}>
                          <h6 className="career-title">
                            الخطة الوظيفية {assignedCareerPlans.length > 1 ? `#${index + 1}` : ''}
                          </h6>
                        </Col>
                        <Col md={2}>
                          {assignedCareerPlans.length > 1 && (
                            <Button 
                              variant="outline-danger" 
                              onClick={() => removeCareerPlan(index)}
                              className="remove-btn"
                              size="sm"
                              type="button"
                            >
                              ✕ حذف
                            </Button>
                          )}
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3 form-group-custom">
                            <Form.Label>الخطة الوظيفية السابقة</Form.Label>
                            <Form.Control 
                              type="text" 
                              placeholder="الخطة الوظيفية السابقة" 
                              className="form-input"
                              value={careerPlan.career_plan}
                              onChange={(e) => updateCareerPlan(index, 'career_plan', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3 form-group-custom">
                            <Form.Label>تاريخ مباشرة الخطة الوظيفية</Form.Label>
                            <Form.Control 
                              type="date" 
                              className="form-input"
                              value={careerPlan.career_plan_start_date}
                              onChange={(e) => updateCareerPlan(index, 'career_plan_start_date', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>

                {/* Section 13: ملاحظات عامة *//*}
                <div className="form-section">
                  <h4 className="section-title">ملاحظات عامة</h4>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>ملاحظات عامة</Form.Label>
                        <Form.Control 
                          as="textarea" 
                          rows={4} 
                          placeholder="ملاحظات عامة" 
                          className="form-input" 
                          name="general_notes"
                          value={newUser.general_notes}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Bouton de soumission *//*}
                <div className="form-actions">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="submit-btn"
                    disabled={auth.isLoad}
                  >
                    {auth.isLoad ? 'جاري التسجيل...' : 'تسجيل الحساب'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Register
*/

import React, { useState, useEffect } from 'react'
import { Button, Form, Container, Row, Col, Card, Alert } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { register } from '../../JS/actions/AuthAction'
import './Register.css'

const Register = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const auth = useSelector(state => state.authReducer)

  const [newUser, setNewUser] = useState({
    // Informations de connexion
    email_address: "",
    password: "",
    
    // Informations personnelles
    name: "",
    gender: "",
    profile_picture: "",
    
    // Informations d'identification
    id_card_number: "",
    id_card_issue_date: "",
    passport_number: "",
    passport_date: "",
    
    // Numéros officiels
    id_number: "",
    cooperative_number: "",
    unique_id: "",
    
    // Informations professionnelles
    current_career_plan: "",
    current_plan_start_date: "",
    current_plan_seniority: "",
    career_plan_obtainment_date: "",
    career_plan_seniority: "",
    grade: "",
    grade_obtainment_date: "",
    rank_seniority: "",
    appointment_date: "",
    professional_seniority: "",
    retirement_date: "",
    
    // Informations personnelles détaillées
    date_of_birth: "",
    age: "",
    health_status: "",
    place_of_birth_by_state: "",
    place_of_birth_by_delegation: "",
    place_of_origin_by_state: "",
    place_of_origin_by_delegation: "",
    
    // Informations familiales
    family_address: "",
    family_status: "",
    children_count: "",
    
    // Informations du conjoint
    spouse_employment_status: "",
    spouse_occupation_and_workplace: "",
    spouse_birth_place: "",
    spouse_place_of_origin_by_state: "",
    spouse_place_of_origin_by_delegation: "",
    spouse_health_status: "",
    
    // Notes générales
    general_notes: ""
  })

  // États séparés pour les tableaux
  const [phoneNumbers, setPhoneNumbers] = useState([{ number: "" }])
  const [children, setChildren] = useState([{
    children_names: '',
    children_birth_dates: '',
    children_status: '',
    children_education_work_places: '',
    children_health_status: ''
  }])
  const [assignedCareerPlans, setAssignedCareerPlans] = useState([{
    career_plan: '',
    career_plan_start_date: ''
  }])

  // Redirection après inscription réussie
  useEffect(() => {
    if (auth.isAuth) {
      navigate("/profile")
    }
  }, [auth.isAuth, navigate])

  const handleChange = (e) => {
    setNewUser({...newUser, [e.target.name]: e.target.value})
  }

  // Fonction pour upload d'image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة فقط');
        return;
      }
      
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة يجب أن يكون أقل من 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        // Convertir l'image en base64
        const base64Image = event.target.result;
        setNewUser(prev => ({
          ...prev,
          profile_picture: base64Image
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Fonction de soumission
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Préparer les données pour l'envoi
    const userData = {
      ...newUser,
      phone_numbers: phoneNumbers.filter(phone => phone.number.trim() !== ''),
      children: children.filter(child => child.children_names.trim() !== ''),
      assigned_career_plans: assignedCareerPlans.filter(plan => plan.career_plan.trim() !== '')
    }
    
    console.log('Données envoyées:', userData)
    dispatch(register(userData, navigate))
  }

  // Fonctions pour les numéros de téléphone
  const addPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, { number: "" }])
  }

  const updatePhoneNumber = (index, value) => {
    const newPhoneNumbers = [...phoneNumbers]
    newPhoneNumbers[index].number = value
    setPhoneNumbers(newPhoneNumbers)
  }

  const removePhoneNumber = (index) => {
    if (phoneNumbers.length > 1) {
      const newPhoneNumbers = phoneNumbers.filter((_, i) => i !== index)
      setPhoneNumbers(newPhoneNumbers)
    }
  }

  // Fonctions pour les enfants
  const addChild = () => {
    setChildren([...children, {
      children_names: '',
      children_birth_dates: '',
      children_status: '',
      children_education_work_places: '',
      children_health_status: ''
    }])
  }

  const updateChild = (index, field, value) => {
    const newChildren = [...children]
    newChildren[index][field] = value
    setChildren(newChildren)
  }

  const removeChild = (index) => {
    if (children.length > 1) {
      const newChildren = children.filter((_, i) => i !== index)
      setChildren(newChildren)
    }
  }

  // Fonctions pour les plans de carrière
  const addCareerPlan = () => {
    setAssignedCareerPlans([...assignedCareerPlans, {
      career_plan: '',
      career_plan_start_date: ''
    }])
  }

  const updateCareerPlan = (index, field, value) => {
    const newCareerPlans = [...assignedCareerPlans]
    newCareerPlans[index][field] = value
    setAssignedCareerPlans(newCareerPlans)
  }

  const removeCareerPlan = (index) => {
    if (assignedCareerPlans.length > 1) {
      const newCareerPlans = assignedCareerPlans.filter((_, i) => i !== index)
      setAssignedCareerPlans(newCareerPlans)
    }
  }

  return (
    <Container className="register-container">
      <Row className="justify-content-center">
        <Col lg={12}>
          <Card className="register-card">
            <Card.Header className="register-header">
              <h2 className="register-title">Minerva Link</h2>
              <p className="register-subtitle">نموذج التسجيل</p>
            </Card.Header>
            <Card.Body>
              {/* Alertes pour les erreurs/succès */}
              {auth.errors && auth.errors.length > 0 && (
                <Alert variant="danger" className="mb-4">
                  <ul className="mb-0">
                    {auth.errors.map((error, index) => (
                      <li key={index}>{error.msg || error}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              {auth.success && auth.success.length > 0 && (
                <Alert variant="success" className="mb-4">
                  {Array.isArray(auth.success) ? auth.success.join(', ') : auth.success}
                </Alert>
              )}

              <Form className="register-form" onSubmit={handleSubmit}>
                
                {/* Section 1: معلومات الاتصال */}
                <div className="form-section">
                  <h4 className="section-title">معلومات الاتصال</h4>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>البريد الالكتروني *</Form.Label>
                        <Form.Control 
                          type="email" 
                          placeholder="البريد الالكتروني" 
                          className="form-input"
                          name="email_address" 
                          value={newUser.email_address} 
                          onChange={handleChange}
                          required 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الرقم السري للولوج الى التطبيقة *</Form.Label>
                        <Form.Control 
                          type="password" 
                          placeholder="الرقم السري" 
                          className="form-input"
                          name="password"
                          value={newUser.password}
                          onChange={handleChange}
                          required 
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 2: المعلومات الشخصية */}
                <div className="form-section">
                  <h4 className="section-title">المعطيات الشخصية</h4>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الاسم واللقب *</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="الاسم واللقب" 
                          className="form-input" 
                          name="name"
                          value={newUser.name}
                          onChange={handleChange}
                          required 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الجنس *</Form.Label>
                        <Form.Select 
                          className="form-input" 
                          name="gender"
                          value={newUser.gender}
                          onChange={handleChange}
                          required
                        >
                          <option value="">اختر الجنس</option>
                          <option value="ذكر">ذكر</option>
                          <option value="أنثى">أنثى</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>صورة المستخدم</Form.Label>
                        <Form.Control 
                          type="file" 
                          accept="image/*"
                          className="form-input" 
                          onChange={handleImageUpload}
                        />
                        <Form.Text className="text-muted">
                          اختر صورة من جهازك (الحد الأقصى 5MB)
                        </Form.Text>
                        {newUser.profile_picture && (
                          <div className="mt-2 text-center">
                            <img 
                              src={newUser.profile_picture} 
                              alt="معاينة الصورة" 
                              style={{
                                width: '100px', 
                                height: '100px', 
                                objectFit: 'cover', 
                                borderRadius: '50%',
                                border: '2px solid #ddd'
                              }}
                            />
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 3: أرقام الهاتف */}
                <div className="form-section">
                  <h4 className="section-title">أرقام الهاتف الخاصة بالمستخدم</h4>
                  
                  <div className="mb-3 text-left">
                    <Button 
                      variant="outline-success" 
                      onClick={addPhoneNumber}
                      className="add-phone-btn"
                      size="sm"
                      type="button"
                    >
                      + إضافة رقم هاتف
                    </Button>
                  </div>

                  {phoneNumbers.map((phone, index) => (
                    <Row key={index} className="phone-number-row align-items-center mb-2">
                      <Col md={10}>
                        <Form.Group className="form-group-custom">
                          <Form.Label>
                            رقم الهاتف {phoneNumbers.length > 1 ? `#${index + 1}` : ''}
                          </Form.Label>
                          <Form.Control 
                            type="tel" 
                            placeholder="أدخل رقم الهاتف" 
                            className="form-input"
                            value={phone.number}
                            onChange={(e) => updatePhoneNumber(index, e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        {phoneNumbers.length > 1 && (
                          <Button 
                            variant="outline-danger" 
                            onClick={() => removePhoneNumber(index)}
                            className="remove-phone-btn mt-4"
                            size="sm"
                            type="button"
                          >
                            ✕
                          </Button>
                        )}
                      </Col>
                    </Row>
                  ))}
                </div>

                {/* Section 4: بطاقة التعريف الوطنية */}
                <div className="form-section">
                  <h4 className="section-title">بطاقة التعريف الوطنية</h4>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>رقم بطاقة التعريف الوطنية</Form.Label>
                        <Form.Control 
                          type="number" 
                          placeholder="رقم بطاقة التعريف الوطنية" 
                          className="form-input" 
                          name="id_card_number"
                          value={newUser.id_card_number}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>تاريخ اصدار بطاقة التعريف الوطنية</Form.Label>
                        <Form.Control 
                          type="date" 
                          className="form-input" 
                          name="id_card_issue_date"
                          value={newUser.id_card_issue_date}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 5: جواز السفر */}
                <div className="form-section">
                  <h4 className="section-title">جواز السفر</h4>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>رقم جواز السفر</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="رقم جواز السفر" 
                          className="form-input" 
                          name="passport_number"
                          value={newUser.passport_number}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>تاريخ اصدار جواز السفر</Form.Label>
                        <Form.Control 
                          type="date" 
                          className="form-input" 
                          name="passport_date"
                          value={newUser.passport_date}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 6: الأرقام الرسمية */}
                <div className="form-section">
                  <h4 className="section-title">الأرقام المهنية</h4>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الرقم الشخصي *</Form.Label>
                        <Form.Control 
                          type="number" 
                          placeholder="الرقم الشخصي" 
                          className="form-input" 
                          name="id_number"
                          value={newUser.id_number}
                          onChange={handleChange}
                          required 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>رقم التعاونية</Form.Label>
                        <Form.Control 
                          type="number" 
                          placeholder="رقم التعاونية" 
                          className="form-input" 
                          name="cooperative_number"
                          value={newUser.cooperative_number}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الرقم الموحد</Form.Label>
                        <Form.Control 
                          type="number" 
                          placeholder="الرقم الموحد" 
                          className="form-input" 
                          name="unique_id"
                          value={newUser.unique_id}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 7: المعلومات الوظيفية */}
                <div className="form-section">
                  <h4 className="section-title">المعلومات الوظيفية</h4>
                  
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الخطة الوظيفية الحالية</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="الخطة الوظيفية الحالية" 
                          className="form-input" 
                          name="current_career_plan"
                          value={newUser.current_career_plan}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>تاريخ التعيين بالخطة الحالية</Form.Label>
                        <Form.Control 
                          type="date" 
                          className="form-input" 
                          name="current_plan_start_date"
                          value={newUser.current_plan_start_date}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الاقدمية في الخطة الحالية</Form.Label>
                        <Form.Control 
                          type="number" 
                          placeholder="الاقدمية في الخطة الحالية" 
                          className="form-input" 
                          name="current_plan_seniority"
                          value={newUser.current_plan_seniority}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>تاريخ الحصول على الخطة الوظيفية</Form.Label>
                        <Form.Control 
                          type="date" 
                          className="form-input" 
                          name="career_plan_obtainment_date"
                          value={newUser.career_plan_obtainment_date}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الاقدمية في الخطة الوظيفية</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="الاقدمية في الخطة الوظيفية" 
                          className="form-input" 
                          name="career_plan_seniority"
                          value={newUser.career_plan_seniority}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الرتبة *</Form.Label>
                        <Form.Select 
                          className="form-input" 
                          name="grade"
                          value={newUser.grade}
                          onChange={handleChange}
                          required
                        >
                          <option value="">اختر الرتبة</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="E">E</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>تاريخ الحصول على الرتبة</Form.Label>
                        <Form.Control 
                          type="date" 
                          className="form-input" 
                          name="grade_obtainment_date"
                          value={newUser.grade_obtainment_date}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الاقدمية في الرتبة</Form.Label>
                        <Form.Control 
                          type="number" 
                          placeholder="الاقدمية في الرتبة" 
                          className="form-input" 
                          name="rank_seniority"
                          value={newUser.rank_seniority}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>تاريخ الانتداب</Form.Label>
                        <Form.Control 
                          type="date" 
                          className="form-input" 
                          name="appointment_date"
                          value={newUser.appointment_date}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الاقدمية المهنية</Form.Label>
                        <Form.Control 
                          type="number" 
                          placeholder="الاقدمية المهنية" 
                          className="form-input" 
                          name="professional_seniority"
                          value={newUser.professional_seniority}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>تاريخ التقاعد</Form.Label>
                        <Form.Control 
                          type="date" 
                          className="form-input" 
                          name="retirement_date"
                          value={newUser.retirement_date}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 8: المعلومات الشخصية التفصيلية */}
                <div className="form-section">
                  <h4 className="section-title">المعلومات الشخصية التفصيلية</h4>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>تاريخ الولادة</Form.Label>
                        <Form.Control 
                          type="date" 
                          className="form-input" 
                          name="date_of_birth"
                          value={newUser.date_of_birth}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>العمر</Form.Label>
                        <Form.Control 
                          type="number" 
                          placeholder="العمر" 
                          className="form-input" 
                          name="age"
                          value={newUser.age}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الحالة الصحية للمستخدم</Form.Label>
                        <Form.Select 
                          className="form-input" 
                          name="health_status"
                          value={newUser.health_status}
                          onChange={handleChange}
                        >
                          <option value="">اختر الحالة الصحية</option>
                          <option value="صحة ممتازة بدون أي مشاكل">صحة ممتازة بدون أي مشاكل</option>
                          <option value="صحة جيدة بدون أمراض مزمنة">صحة جيدة بدون أمراض مزمنة</option>
                          <option value="مقبول - بعض المشاكل الصحية العادية">مقبول - بعض المشاكل الصحية العادية</option>
                          <option value="يحتاج متابعة - أمراض تحت المراقبة">يحتاج متابعة - أمراض تحت المراقبة</option>
                          <option value="مزمن - أمراض مزمنة مستقرة">مزمن - أمراض مزمنة مستقرة</option>
                          <option value="خاص - حالات صحية خاصة">خاص - حالات صحية خاصة</option>
                          <option value="إعاقة - شخص من ذوي الاعاقة">إعاقة - شخص من ذوي الاعاقة</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>مكان الولادة حسب الولاية</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="مكان الولادة حسب الولاية" 
                          className="form-input" 
                          name="place_of_birth_by_state"
                          value={newUser.place_of_birth_by_state}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>مكان الولادة حسب المعتمدية</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="مكان الولادة حسب المعتمدية" 
                          className="form-input" 
                          name="place_of_birth_by_delegation"
                          value={newUser.place_of_birth_by_delegation}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>مسقط الرأس حسب الولاية</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="مسقط الرأس حسب الولاية" 
                          className="form-input" 
                          name="place_of_origin_by_state"
                          value={newUser.place_of_origin_by_state}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>مسقط الرأس حسب المعتمدية</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="مسقط الرأس حسب المعتمدية" 
                          className="form-input" 
                          name="place_of_origin_by_delegation"
                          value={newUser.place_of_origin_by_delegation}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 9: المعلومات العائلية */}
                <div className="form-section">
                  <h4 className="section-title">المعلومات العائلية</h4>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>عنوان اقامة العائلة</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="عنوان اقامة العائلة" 
                          className="form-input" 
                          name="family_address"
                          value={newUser.family_address}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الحالة العائلية</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="الحالة العائلية" 
                          className="form-input" 
                          name="family_status"
                          value={newUser.family_status}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>عدد الأطفال</Form.Label>
                        <Form.Control 
                          type="number" 
                          placeholder="عدد الاطفال" 
                          className="form-input" 
                          name="children_count"
                          value={newUser.children_count}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 10: معلومات القرين */}
                <div className="form-section">
                  <h4 className="section-title">معلومات القرين</h4>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الوضعية المهنية للقرين</Form.Label>
                        <Form.Select 
                          className="form-input" 
                          name="spouse_employment_status"
                          value={newUser.spouse_employment_status}
                          onChange={handleChange}
                        >
                          <option value="">اختر الوضعية المهنية</option>
                          <option value="قطاع عام">قطاع عام</option>
                          <option value="قطاع خاص">قطاع خاص</option>
                          <option value="مهن حرة">مهن حرة</option>
                          <option value="طالب">طالب</option>
                          <option value="عاطل عن العمل">عاطل عن العمل</option>
                          <option value="لا يعمل">لا يعمل</option>
                          <option value="متقاعد">متقاعد</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>مهنة القرين ومكان عمله</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="مهنة القرين ومكان عمله" 
                          className="form-input" 
                          name="spouse_occupation_and_workplace"
                          value={newUser.spouse_occupation_and_workplace}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>مكان ولادة القرين</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="مكان ولادة القرين" 
                          className="form-input" 
                          name="spouse_birth_place"
                          value={newUser.spouse_birth_place}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>مسقط رأس القرين حسب الولاية</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="مسقط رأس القرين حسب الولاية" 
                          className="form-input" 
                          name="spouse_place_of_origin_by_state"
                          value={newUser.spouse_place_of_origin_by_state}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>مسقط رأس القرين حسب المعتمدية</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="مسقط رأس القرين حسب المعتمدية" 
                          className="form-input" 
                          name="spouse_place_of_origin_by_delegation"
                          value={newUser.spouse_place_of_origin_by_delegation}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الحالة الصحية للقرين</Form.Label>
                        <Form.Select 
                          className="form-input" 
                          name="spouse_health_status"
                          value={newUser.spouse_health_status}
                          onChange={handleChange}
                        >
                          <option value="">اختر الحالة الصحية</option>
                          <option value="صحة ممتازة بدون أي مشاكل">صحة ممتازة بدون أي مشاكل</option>
                          <option value="صحة جيدة بدون أمراض مزمنة">صحة جيدة بدون أمراض مزمنة</option>
                          <option value="مقبول - بعض المشاكل الصحية العادية">مقبول - بعض المشاكل الصحية العادية</option>
                          <option value="يحتاج متابعة - أمراض تحت المراقبة">يحتاج متابعة - أمراض تحت المراقبة</option>
                          <option value="مزمن - أمراض مزمنة مستقرة">مزمن - أمراض مزمنة مستقرة</option>
                          <option value="خاص - حالات صحية خاصة">خاص - حالات صحية خاصة</option>
                          <option value="إعاقة - شخص من ذوي الاعاقة">إعاقة - شخص من ذوي الاعاقة</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 11: معلومات الأطفال */}
                <div className="form-section">
                  <h4 className="section-title">معلومات الأطفال</h4>
                  
                  <div className="mb-3 text-left">
                    <Button 
                      variant="outline-info" 
                      onClick={addChild}
                      className="add-btn"
                      size="sm"
                      type="button"
                    >
                      + إضافة طفل
                    </Button>
                  </div>

                  {children.map((child, index) => (
                    <div key={`child-${index}`} className="child-section mb-4 p-3 border rounded">
                      <Row className="align-items-center mb-2">
                        <Col md={10}>
                          <h6 className="child-title">
                            الطفل {children.length > 1 ? `#${index + 1}` : ''}
                          </h6>
                        </Col>
                        <Col md={2}>
                          {children.length > 1 && (
                            <Button 
                              variant="outline-danger" 
                              onClick={() => removeChild(index)}
                              className="remove-btn"
                              size="sm"
                              type="button"
                            >
                              ✕ حذف
                            </Button>
                          )}
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3 form-group-custom">
                            <Form.Label>اسم الطفل</Form.Label>
                            <Form.Control 
                              type="text" 
                              placeholder="اسم الطفل" 
                              className="form-input"
                              value={child.children_names}
                              onChange={(e) => updateChild(index, 'children_names', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3 form-group-custom">
                            <Form.Label>تاريخ ولادة الطفل</Form.Label>
                            <Form.Control 
                              type="date" 
                              className="form-input"
                              value={child.children_birth_dates}
                              onChange={(e) => updateChild(index, 'children_birth_dates', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3 form-group-custom">
                            <Form.Label>الوضعية العائلية للطفل</Form.Label>
                            <Form.Control 
                              type="text" 
                              placeholder="الوضعية العائلية للطفل" 
                              className="form-input"
                              value={child.children_status}
                              onChange={(e) => updateChild(index, 'children_status', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3 form-group-custom">
                            <Form.Label>مكان دراسة او عمل الطفل</Form.Label>
                            <Form.Control 
                              type="text" 
                              placeholder="مكان دراسة او عمل الطفل" 
                              className="form-input"
                              value={child.children_education_work_places}
                              onChange={(e) => updateChild(index, 'children_education_work_places', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={12}>
                          <Form.Group className="mb-3 form-group-custom">
                            <Form.Label>الحالة الصحية للطفل</Form.Label>
                            <Form.Select 
                              className="form-input"
                              value={child.children_health_status}
                              onChange={(e) => updateChild(index, 'children_health_status', e.target.value)}
                            >
                              <option value="">اختر الحالة الصحية</option>
                              <option value="صحة ممتازة بدون أي مشاكل">صحة ممتازة بدون أي مشاكل</option>
                              <option value="صحة جيدة بدون أمراض مزمنة">صحة جيدة بدون أمراض مزمنة</option>
                              <option value="مقبول - بعض المشاكل الصحية العادية">مقبول - بعض المشاكل الصحية العادية</option>
                              <option value="يحتاج متابعة - أمراض تحت المراقبة">يحتاج متابعة - أمراض تحت المراقبة</option>
                              <option value="مزمن - أمراض مزمنة مستقرة">مزمن - أمراض مزمنة مستقرة</option>
                              <option value="خاص - حالات صحية خاصة">خاص - حالات صحية خاصة</option>
                              <option value="إعاقة - شخص من ذوي الاعاقة">إعاقة - شخص من ذوي الاعاقة</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>

                {/* Section 12: الخطط الوظيفية السابقة */}
                <div className="form-section">
                  <h4 className="section-title">المسار المهني</h4>
                  
                  <div className="mb-3 text-left">
                    <Button 
                      variant="outline-warning" 
                      onClick={addCareerPlan}
                      className="add-btn"
                      size="sm"
                      type="button"
                    >
                      + إضافة خطة وظيفية
                    </Button>
                  </div>

                  {assignedCareerPlans.map((careerPlan, index) => (
                    <div key={`career-${index}`} className="career-section mb-4 p-3 border rounded">
                      <Row className="align-items-center mb-2">
                        <Col md={10}>
                          <h6 className="career-title">
                            الخطة الوظيفية {assignedCareerPlans.length > 1 ? `#${index + 1}` : ''}
                          </h6>
                        </Col>
                        <Col md={2}>
                          {assignedCareerPlans.length > 1 && (
                            <Button 
                              variant="outline-danger" 
                              onClick={() => removeCareerPlan(index)}
                              className="remove-btn"
                              size="sm"
                              type="button"
                            >
                              ✕ حذف
                            </Button>
                          )}
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3 form-group-custom">
                            <Form.Label>الخطة الوظيفية السابقة</Form.Label>
                            <Form.Control 
                              type="text" 
                              placeholder="الخطة الوظيفية السابقة" 
                              className="form-input"
                              value={careerPlan.career_plan}
                              onChange={(e) => updateCareerPlan(index, 'career_plan', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3 form-group-custom">
                            <Form.Label>تاريخ مباشرة الخطة الوظيفية</Form.Label>
                            <Form.Control 
                              type="date" 
                              className="form-input"
                              value={careerPlan.career_plan_start_date}
                              onChange={(e) => updateCareerPlan(index, 'career_plan_start_date', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>

                {/* Section 13: ملاحظات عامة */}
                <div className="form-section">
                  <h4 className="section-title">ملاحظات عامة</h4>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>ملاحظات عامة</Form.Label>
                        <Form.Control 
                          as="textarea" 
                          rows={4} 
                          placeholder="ملاحظات عامة" 
                          className="form-input" 
                          name="general_notes"
                          value={newUser.general_notes}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Bouton de soumission */}
                <div className="form-actions">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="submit-btn"
                    disabled={auth.isLoad}
                  >
                    {auth.isLoad ? 'جاري التسجيل...' : 'تسجيل الحساب'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Register