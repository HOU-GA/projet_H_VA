
//pour que l'admin peut changer tous les profil de user
import React, { useState, useEffect } from 'react'
import { Button, Form, Modal, Alert, Row, Col, Spinner, Card } from 'react-bootstrap'
import { useDispatch } from 'react-redux'
import { getUserById, getUsers, updateUserProfile } from '../../JS/actions/AdminAction';
import './EditUserProfile.css'

const EditUserProfile = ({ user, onUpdate }) => {
  const [show, setShow] = useState(false);
  const dispatch = useDispatch()
  
  const [formData, setFormData] = useState({})
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
  
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [updateSuccess, setUpdateSuccess] = useState(false)

  const handleClose = () => {
    setShow(false);
    setUpdateError('');
    setUpdateSuccess(false);
  };
  
  const handleShow = () => setShow(true);

  // Fonction pour upload d'image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setUpdateError('يرجى اختيار ملف صورة فقط');
        return;
      }
      
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUpdateError('حجم الصورة يجب أن يكون أقل من 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        // Convertir l'image en base64
        const base64Image = event.target.result;
        setFormData(prev => ({
          ...prev,
          profile_picture: base64Image
        }));
        setUpdateError('');
      };
      reader.onerror = () => {
        setUpdateError('خطأ في قراءة الملف');
      };
      reader.readAsDataURL(file);
    }
  };

  // Fonction utilitaire pour convertir les dates
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  }

  // Fonction pour traiter les numéros de téléphone de manière sécurisée
  const safeProcessPhoneNumbers = (phones) => {
    if (!phones || !Array.isArray(phones)) return [{ number: "" }];
    
    return phones
      .filter(phone => phone && phone.number !== undefined && phone.number !== null)
      .map(phone => ({
        number: String(phone.number || "")
      }));
  }

  // Initialiser les données du formulaire
  useEffect(() => {
    if (user) {
      console.log('🟢 Données utilisateur chargées pour édition:', user);
      
      setFormData({
        // المعلومات الشخصية
        name: user.name || '',
        gender: user.gender || '',
        profile_picture: user.profile_picture || '',
        
        // وثائق الهوية
        id_card_number: user.id_card_number || '',
        id_card_issue_date: formatDateForInput(user.id_card_issue_date),
        passport_number: user.passport_number || '',
        passport_date: formatDateForInput(user.passport_date),
        
        // الأرقام الإدارية
        cooperative_number: user.cooperative_number || '',
        unique_id: user.unique_id || '',
        
        // المسار الوظيفي
        grade: user.grade || '',
        grade_obtainment_date: formatDateForInput(user.grade_obtainment_date),
        rank_seniority: user.rank_seniority || '',
        appointment_date: formatDateForInput(user.appointment_date),
        professional_seniority: user.professional_seniority || '',
        retirement_date: formatDateForInput(user.retirement_date),
        
        // المعلومات الشخصية التفصيلية
        date_of_birth: formatDateForInput(user.date_of_birth),
        age: user.age || '',
        place_of_birth_by_state: user.place_of_birth_by_state || '',
        place_of_birth_by_delegation: user.place_of_birth_by_delegation || '',
        
        // الصحة
        health_status: user.health_status || '',
        
        // الأصل
        place_of_origin_by_state: user.place_of_origin_by_state || '',
        place_of_origin_by_delegation: user.place_of_origin_by_delegation || '',
        
        // الوضعية العائلية
        family_address: user.family_address || '',
        family_status: user.family_status || '',
        
        // معلومات القرين
        spouse_employment_status: user.spouse_employment_status || '',
        spouse_occupation_and_workplace: user.spouse_occupation_and_workplace || '',
        spouse_birth_place: user.spouse_birth_place || '',
        spouse_place_of_origin_by_state: user.spouse_place_of_origin_by_state || '',
        spouse_place_of_origin_by_delegation: user.spouse_place_of_origin_by_delegation || '',
        spouse_health_status: user.spouse_health_status || '',
        
        // الأطفال
        children_count: user.children_count || '',
        
        // ملاحظات
        general_notes: user.general_notes || '',
      })

      // ✅ CORRECTION CRITIQUE : Traitement sécurisé des numéros de téléphone
      setPhoneNumbers(safeProcessPhoneNumbers(user.phone_numbers));

      // ✅ CORRECTION SÉCURISÉE des enfants
      if (user.children && Array.isArray(user.children) && user.children.length > 0) {
        const validChildren = user.children.filter(child => child && child.children_names);
        if (validChildren.length > 0) {
          setChildren(validChildren.map(child => ({
            children_names: child.children_names || '',
            children_birth_dates: formatDateForInput(child.children_birth_dates),
            children_status: child.children_status || '',
            children_education_work_places: child.children_education_work_places || '',
            children_health_status: child.children_health_status || ''
          })));
        }
      }

      // ✅ CORRECTION SÉCURISÉE des plans de carrière
      if (user.assigned_career_plans && Array.isArray(user.assigned_career_plans) && user.assigned_career_plans.length > 0) {
        const validPlans = user.assigned_career_plans.filter(plan => plan && plan.career_plan);
        if (validPlans.length > 0) {
          setAssignedCareerPlans(validPlans.map(plan => ({
            career_plan: plan.career_plan || '',
            career_plan_start_date: formatDateForInput(plan.career_plan_start_date)
          })));
        }
      }
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData, 
      [name]: value
    }));
  }

  // وظائف أرقام الهاتف
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

  // وظائف الأطفال
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

  // وظائف الخطط الوظيفية
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

  // ✅ CORRECTION COMPLÈTE : Nettoyage sécurisé des données
  const cleanDataForSubmission = (data) => {
    const cleaned = { ...data };
    
    // Supprimer les champs vides
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === '' || cleaned[key] === null || cleaned[key] === undefined) {
        delete cleaned[key];
      }
    });

    // ✅ CORRECTION CRITIQUE : Traitement sécurisé des numéros de téléphone
    if (cleaned.phone_numbers && Array.isArray(cleaned.phone_numbers)) {
      cleaned.phone_numbers = cleaned.phone_numbers
        .filter(phone => phone && phone.number !== undefined && phone.number !== null)
        .map(phone => {
          // Convertir en string et nettoyer
          const phoneNumber = String(phone.number || '');
          return { 
            number: phoneNumber.trim() 
          };
        })
        .filter(phone => phone.number !== ''); // Supprimer les numéros vides
      
      if (cleaned.phone_numbers.length === 0) {
        delete cleaned.phone_numbers;
      }
    }

    // Traitement des enfants
    if (cleaned.children && Array.isArray(cleaned.children)) {
      cleaned.children = cleaned.children
        .filter(child => child && child.children_names && String(child.children_names).trim() !== '')
        .map(child => ({
          children_names: String(child.children_names || '').trim(),
          children_birth_dates: child.children_birth_dates || undefined,
          children_status: child.children_status || '',
          children_education_work_places: child.children_education_work_places || '',
          children_health_status: child.children_health_status || ''
        }));
      
      if (cleaned.children.length === 0) {
        delete cleaned.children;
      }
    }

    // Traitement des plans de carrière
    if (cleaned.assigned_career_plans && Array.isArray(cleaned.assigned_career_plans)) {
      cleaned.assigned_career_plans = cleaned.assigned_career_plans
        .filter(plan => plan && plan.career_plan && String(plan.career_plan).trim() !== '')
        .map(plan => ({
          career_plan: String(plan.career_plan || '').trim(),
          career_plan_start_date: plan.career_plan_start_date || undefined
        }));
      
      if (cleaned.assigned_career_plans.length === 0) {
        delete cleaned.assigned_career_plans;
      }
    }

    return cleaned;
  }

  const handleEdit = async (e) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
    if (!formData.name || formData.name.trim() === "") {
      return setUpdateError("الرجاء إدخال الاسم !!")
    }
  
    if (!formData.gender) {
      return setUpdateError("الرجاء اختيار الجنس !!")
    }
  
    if (!formData.grade || formData.grade.trim() === "") {
      return setUpdateError("الرجاء إدخال الرتبة !!")
    }
  
    setUpdateLoading(true);
    setUpdateError('');
    
    try {
      const submissionData = cleanDataForSubmission({
        ...formData,
        phone_numbers: phoneNumbers,
        children: children,
        assigned_career_plans: assignedCareerPlans
      });
  
      console.log('🟢 البيانات المرسلة:', submissionData);
      
      // Envoyer les données via l'action ADMIN
      const result = await dispatch(updateUserProfile(user._id, submissionData));
      
      console.log('✅ Result from ADMIN dispatch:', result);
      
      // ✅ SUCCÈS - Fermer immédiatement
      setUpdateSuccess(true);
      
      // ✅ CORRECTION : Fermeture avec callback de rafraîchissement
      setTimeout(() => {
        console.log('✅ إغلاق النافذة بعد التحديث الناجح (Admin)');
        
        // ✅ Fermer le modal
        handleClose();
        setUpdateSuccess(false);
        
        // ✅ FORCER le rafraîchissement des données
        if (onUpdate) {
          console.log('🔄 استدعاء onUpdate لتحديث البيانات');
          onUpdate(); // Cette fonction doit recharger les données utilisateur
        }
        
        // ✅ CORRECTION SUPPLEMENTAIRE : Forcer le re-rendu du composant parent
        // Si onUpdate n'est pas défini, recharger manuellement
        if (!onUpdate) {
          console.log('🔄 إعادة تحميل البيانات يدوياً');
          // Recharger l'utilisateur modifié
          dispatch(getUserById(user._id));
          // Ou recharger toute la liste
          dispatch(getUsers());
        }
        
      }, 800);
      
    } catch (error) {
      console.error('❌ خطأ في التحديث (Admin):', error);
      
      // Gestion d'erreur
      let errorMessage = 'خطأ في تحديث البيانات';
      
      if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setUpdateError(errorMessage);
      setUpdateLoading(false);
    }
  };

  return (
    <div>
      <Button variant="warning" onClick={handleShow} className="edit-profile-btn">
        ✏️ تعديل الملف الشخصي
      </Button>

      <Modal show={show} onHide={handleClose} size="xl" scrollable backdrop="static" dir="rtl">
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>
            <div className="d-flex align-items-center">
              <div className="modal-title-icon">✏️</div>
              <div>
                <h5 className="mb-0">تعديل الملف الشخصي</h5>
                <small className="text-muted">{user?.name}</small>
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="modal-body-custom">
          {updateSuccess && (
            <Alert variant="success" className="mb-4">
              <div className="d-flex align-items-center">
                <span className="me-2">✅</span>
                <span>تم تحديث الملف الشخصي بنجاح</span>
              </div>
            </Alert>
          )}

          {updateError && (
            <Alert variant="danger" className="mb-4">
              <div className="d-flex align-items-center">
                <span className="me-2">❌</span>
                <span>{updateError}</span>
              </div>
            </Alert>
          )}

          <Card className="register-card">
            <Card.Body>
              <Form onSubmit={handleEdit} id="editProfileForm" className="register-form">
                
                {/* Section 1: المعطيات الشخصية */}
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
                          value={formData.name || ''} 
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
                          value={formData.gender || ''} 
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
                        {formData.profile_picture && (
                          <div className="mt-2 text-center">
                            <img 
                              src={formData.profile_picture} 
                              alt="معاينة الصورة" 
                              style={{
                                width: '100px', 
                                height: '100px', 
                                objectFit: 'cover', 
                                borderRadius: '50%',
                                border: '2px solid #ddd'
                              }}
                            />
                            <div className="mt-1">
                              <small className="text-success">✓ تم تحميل الصورة</small>
                            </div>
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 2: أرقام الهاتف الخاصة بالمستخدم */}
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

                {/* Section 3: بطاقة التعريف الوطنية */}
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
                          value={formData.id_card_number || ''} 
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
                          value={formData.id_card_issue_date || ''} 
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 4: جواز السفر */}
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
                          value={formData.passport_number || ''} 
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
                          value={formData.passport_date || ''} 
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 5: الأرقام المهنية */}
                <div className="form-section">
                  <h4 className="section-title">الأرقام المهنية</h4>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>رقم التعاونية</Form.Label>
                        <Form.Control 
                          type="number" 
                          placeholder="رقم التعاونية" 
                          className="form-input" 
                          name="cooperative_number"
                          value={formData.cooperative_number || ''} 
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
                          value={formData.unique_id || ''} 
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 6: المعلومات الوظيفية */}
                <div className="form-section">
                  <h4 className="section-title">المعلومات الوظيفية</h4>
                  
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الرتبة *</Form.Label>
                        <Form.Select 
                          className="form-input" 
                          name="grade"
                          value={formData.grade || ''} 
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
                          value={formData.grade_obtainment_date || ''} 
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
                          value={formData.rank_seniority || ''} 
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
                          value={formData.appointment_date || ''} 
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
                          value={formData.professional_seniority || ''} 
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
                          value={formData.retirement_date || ''} 
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 7: المعلومات الشخصية التفصيلية */}
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
                          value={formData.date_of_birth || ''} 
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
                          value={formData.age || ''} 
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
                          value={formData.health_status || ''} 
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
                          value={formData.place_of_birth_by_state || ''} 
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
                          value={formData.place_of_birth_by_delegation || ''} 
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
                          value={formData.place_of_origin_by_state || ''} 
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
                          value={formData.place_of_origin_by_delegation || ''} 
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 8: المعلومات العائلية */}
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
                          value={formData.family_address || ''} 
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
                          value={formData.family_status || ''} 
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
                          value={formData.children_count || ''} 
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section 9: معلومات القرين */}
                <div className="form-section">
                  <h4 className="section-title">معلومات القرين</h4>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3 form-group-custom">
                        <Form.Label>الوضعية المهنية للقرين</Form.Label>
                        <Form.Select 
                          className="form-input" 
                          name="spouse_employment_status"
                          value={formData.spouse_employment_status || ''} 
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
                          value={formData.spouse_occupation_and_workplace || ''} 
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
                          value={formData.spouse_birth_place || ''} 
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
                          value={formData.spouse_place_of_origin_by_state || ''} 
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
                          value={formData.spouse_place_of_origin_by_delegation || ''} 
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
                          value={formData.spouse_health_status || ''} 
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

                {/* Section 10: معلومات الأطفال */}
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

                {/* Section 11: المسار المهني */}
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

                {/* Section 12: ملاحظات عامة */}
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
                          value={formData.general_notes || ''} 
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Actions */}
                <div className="form-actions">
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleClose} 
                    className="me-2"
                    disabled={updateLoading}
                  >
                    إلغاء
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={updateLoading}
                    className="submit-btn"
                  >
                    {updateLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        جاري الحفظ...
                      </>
                    ) : (
                      '💾 حفظ التعديلات'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default EditUserProfile