
//pages/activites/ActivityForm.jsx
//ok valide 16-10-25
import React, { useState, useEffect, useRef } from 'react'
import { Form, Button, Row, Col, Spinner, Alert, Modal, InputGroup } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { createActivity, updateActivity, getUsersForMention } from '../../JS/actions/ActivityAction'
import Avatar from '../../components/Avatar/Avatar'
import './ActivityForm.css'

const ActivityForm = ({ show, onHide, activityToEdit = null, onSuccess }) => {
    const dispatch = useDispatch()
    const activityState = useSelector(state => state.activityReducer)
    const auth = useSelector(state => state.authReducer)
    
    // ✅ ÉTATS POUR LA GESTION DES UTILISATEURS
    const [usersForMention, setUsersForMention] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [showUserSelector, setShowUserSelector] = useState(false)
    const [selectedUsers, setSelectedUsers] = useState([])
    const [loadingUsers, setLoadingUsers] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    
    // ✅ ÉTATS POUR LES FICHIERS
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef(null)

    // ✅ ÉTAT PRINCIPAL DU FORMULAIRE
    const [formData, setFormData] = useState({
        activity_subject: '',
        general_activity: '',
        activity_type: '',
        description: '',
        notes: '',
        visibility: 'خاص',
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        identified_users_ids: []
    })

    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)

    // ✅ FONCTION DE RÉINITIALISATION
    const resetForm = () => {
        setFormData({
            activity_subject: '',
            general_activity: '',
            activity_type: '',
            description: '',
            notes: '',
            visibility: 'خاص',
            start_date: '',
            end_date: '',
            start_time: '',
            end_time: '',
            identified_users_ids: []
        })
        setSelectedUsers([])
        setUploadedFiles([])
        setSearchTerm('')
        setErrors({})
    }

    // ✅ CORRECTION CRITIQUE : Reset et remplissage COMPLET du formulaire
    useEffect(() => {
        console.log('🔄 ActivityForm useEffect déclenché')
        console.log('📋 show:', show)
        console.log('📋 activityToEdit:', activityToEdit)
        console.log('📋 activityToEdit ID:', activityToEdit?._id)
        console.log('📋 activityToEdit COMPLET:', JSON.stringify(activityToEdit, null, 2))
        
        if (show) {
            // ✅ Réinitialiser l'état d'initialisation
            setIsInitialized(false)
            
            if (activityToEdit && activityToEdit._id) {
                // ✅ MODE ÉDITION - REMPLIR AVEC TOUTES LES DONNÉES EXISTANTES
                console.log('🎯 MODE ÉDITION - Remplissage COMPLET du formulaire')
                
                // ✅ FORMATER LES DATES POUR LES INPUTS HTML
                const formatDateForInput = (dateString) => {
                    if (!dateString) return ""
                    try {
                        // Si c'est déjà au bon format
                        if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            return dateString
                        }
                        // Convertir depuis un objet Date ou ISO string
                        const date = new Date(dateString)
                        if (isNaN(date.getTime())) {
                            console.warn('❌ Date invalide:', dateString)
                            return ""
                        }
                        const year = date.getFullYear()
                        const month = String(date.getMonth() + 1).padStart(2, '0')
                        const day = String(date.getDate()).padStart(2, '0')
                        return `${year}-${month}-${day}`
                    } catch (error) {
                        console.error('❌ Erreur formatage date:', error, 'dateString:', dateString)
                        return ""
                    }
                }

                // ✅ PRÉPARER TOUTES LES DONNÉES POUR LE FORMULAIRE
                const preparedData = {
                    activity_subject: activityToEdit.activity_subject || "",
                    general_activity: activityToEdit.general_activity || "",
                    activity_type: activityToEdit.activity_type || "",
                    description: activityToEdit.description || "",
                    notes: activityToEdit.notes || "",
                    visibility: activityToEdit.visibility || "خاص",
                    
                    // ✅ FORMATAGE CRITIQUE DES DATES
                    start_date: formatDateForInput(activityToEdit.start_date),
                    end_date: formatDateForInput(activityToEdit.end_date),
                    
                    start_time: activityToEdit.start_time || "",
                    end_time: activityToEdit.end_time || "",
                    identified_users_ids: activityToEdit.identified_users?.map(u => u.user?._id || u.user) || []
                }

                console.log('✅ Données préparées pour formulaire:', preparedData)
                console.log('📅 Dates formatées - début:', preparedData.start_date, 'fin:', preparedData.end_date)
                console.log('⏰ Heures - début:', preparedData.start_time, 'fin:', preparedData.end_time)
                
                // Mettre à jour le state du formulaire
                setFormData(preparedData)
                
                // ✅ FORMATER LES UTILISATEURS SÉLECTIONNÉS
                const formattedSelectedUsers = activityToEdit.identified_users?.map(user => {
                    // Gérer les différents formats d'utilisateurs
                    const userData = user.user || user
                    return {
                        _id: userData._id || userData.user?._id,
                        name: userData.name || userData.user?.name || 'Utilisateur inconnu',
                        profile_picture: userData.profile_picture || userData.user?.profile_picture,
                        current_career_plan: userData.current_career_plan || userData.user?.current_career_plan,
                        email: userData.email || userData.user?.email_address,
                        current: userData.current || userData.user?.current_career_plan
                    }
                }).filter(user => user._id) || [] // Filtrer les utilisateurs sans ID
                
                console.log('👥 Utilisateurs sélectionnés formatés:', formattedSelectedUsers)
                setSelectedUsers(formattedSelectedUsers)

                // ✅ GESTION DES FICHIERS UPLOADÉS
                const existingUploads = activityToEdit.uploads || []
                console.log('📁 Fichiers existants:', existingUploads)
                setUploadedFiles(existingUploads)

                setIsInitialized(true)
                
                // ✅ LOG DE CONFIRMATION DÉTAILLÉ
                console.log('📋 Formulaire COMPLÈTEMENT REMPLI avec:')
                console.log('   📌 Sujet:', preparedData.activity_subject)
                console.log('   📌 Activité générale:', preparedData.general_activity)
                console.log('   📌 Type:', preparedData.activity_type)
                console.log('   📌 Description:', preparedData.description)
                console.log('   📌 Notes:', preparedData.notes)
                console.log('   📌 Visibilité:', preparedData.visibility)
                console.log('   📌 Date début:', preparedData.start_date)
                console.log('   📌 Date fin:', preparedData.end_date)
                console.log('   📌 Heure début:', preparedData.start_time)
                console.log('   📌 Heure fin:', preparedData.end_time)
                console.log('   👥 Utilisateurs:', formattedSelectedUsers.length)
                console.log('   📁 Fichiers:', existingUploads.length)
                
            } else {
                // ✅ MODE CRÉATION - FORMULAIRE VIDE
                console.log('🆕 MODE CRÉATION - Formulaire vide')
                resetForm()
                setIsInitialized(true)
            }
            
            // Réinitialiser les erreurs
            setErrors({})
        } else {
            // Quand le modal se ferme, réinitialiser
            setIsInitialized(false)
        }
    }, [show, activityToEdit])

    // ✅ CHARGER LES UTILISATEURS POUR MENTION
    useEffect(() => {
        const loadUsers = async () => {
            if (!show) return
            
            setLoadingUsers(true)
            try {
                console.log('🟢 ActivityForm - Chargement des utilisateurs...')
                const users = await dispatch(getUsersForMention())
                
                console.log('👥 Utilisateurs chargés:', users?.length)
                
                setUsersForMention(users || [])
                setFilteredUsers(users || [])
            } catch (error) {
                console.error('❌ Erreur chargement utilisateurs:', error)
                setUsersForMention([])
                setFilteredUsers([])
            } finally {
                setLoadingUsers(false)
            }
        }
        
        if (show) {
            loadUsers()
        }
    }, [show, dispatch])

    // ✅ FILTRER LES UTILISATEURS
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredUsers(usersForMention)
        } else {
            const searchLower = searchTerm.toLowerCase()
            const filtered = usersForMention.filter(user => {
                const nameMatch = user.name?.toLowerCase().includes(searchLower)
                const currentMatch = user.current?.toLowerCase().includes(searchLower)
                const emailMatch = user.email?.toLowerCase().includes(searchLower)
                const careerMatch = user.current_career_plan?.toLowerCase().includes(searchLower)
                
                return nameMatch || currentMatch || emailMatch || careerMatch
            })
            setFilteredUsers(filtered)
        }
    }, [searchTerm, usersForMention])

    // ✅ GESTION DES CHANGEMENTS DE CHAMPS
    const handleChange = (e) => {
        const { name, value } = e.target
        console.log(`📝 Changement champ ${name}:`, value)
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        
        // Effacer l'erreur du champ quand l'utilisateur tape
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    // ✅ GESTION DU CHANGEMENT D'ACTIVITÉ GÉNÉRALE
    const handleGeneralActivityChange = (e) => {
        const generalActivity = e.target.value
        setFormData({
            ...formData,
            general_activity: generalActivity,
            activity_type: ""
        })
    }

    // ✅ VALIDATION DU FORMULAIRE
    const validateForm = () => {
        const newErrors = {}
        
        if (!formData.activity_subject.trim()) {
            newErrors.activity_subject = 'الموضوع مطلوب'
        }
        if (!formData.general_activity) {
            newErrors.general_activity = 'النشاط العام مطلوب'
        }
        if (!formData.activity_type) {
            newErrors.activity_type = 'نوع النشاط مطلوب'
        }
        if (!formData.start_date) {
            newErrors.start_date = 'تاريخ البداية مطلوب'
        }
        if (!formData.end_date) {
            newErrors.end_date = 'تاريخ النهاية مطلوب'
        }
        if (!formData.start_time) {
            newErrors.start_time = 'وقت البداية مطلوب'
        }
        if (!formData.end_time) {
            newErrors.end_time = 'وقت النهاية مطلوب'
        }

        // Validation des dates
        if (formData.start_date && formData.end_date) {
            const startDate = new Date(formData.start_date)
            const endDate = new Date(formData.end_date)
            if (endDate < startDate) {
                newErrors.end_date = 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // ✅ FONCTIONS POUR LA GESTION DES UTILISATEURS
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
    }

    const resetSearch = () => {
        setSearchTerm('')
        setFilteredUsers(usersForMention)
    }

    const handleUserSelection = (user) => {
        const isSelected = selectedUsers.find(u => u._id === user._id)
        if (isSelected) {
            setSelectedUsers(selectedUsers.filter(u => u._id !== user._id))
        } else {
            setSelectedUsers([...selectedUsers, user])
        }
    }

    const removeSelectedUser = (userId) => {
        setSelectedUsers(selectedUsers.filter(u => u._id !== userId))
    }

    const getUserPosition = (user) => {
        return user.current || user.current_career_plan || 'المنصب غير محدد'
    }

    // ✅ FONCTIONS POUR LA GESTION DES FICHIERS
    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return

        setIsUploading(true)
        
        try {
            const newFiles = files.map(file => ({
                filename: file.name,
                file_url: URL.createObjectURL(file),
                file_type: getFileType(file.type),
                file_size: file.size,
                upload_date: new Date().toISOString(),
                file_object: file
            }))
            
            setUploadedFiles(prev => [...prev, ...newFiles])
            
        } catch (error) {
            console.error('Erreur upload fichiers:', error)
            alert('خطأ في رفع الملفات')
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleViewFile = (file) => {
        if (file.file_url) {
            const newWindow = window.open()
            if (file.file_type === 'image') {
                newWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>${file.filename}</title>
                        <style>
                            body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
                            img { max-width: 100%; max-height: 90vh; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                        </style>
                    </head>
                    <body>
                        <img src="${file.file_url}" alt="${file.filename}" />
                    </body>
                    </html>
                `)
            } else if (file.file_type === 'pdf') {
                newWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>${file.filename}</title>
                        <style>
                            body, html { margin: 0; padding: 0; height: 100%; }
                            embed { width: 100%; height: 100vh; }
                        </style>
                    </head>
                    <body>
                        <embed src="${file.file_url}" type="application/pdf" />
                    </body>
                    </html>
                `)
            } else {
                newWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>${file.filename}</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
                            button { padding: 10px 20px; margin: 10px; cursor: pointer; }
                        </style>
                    </head>
                    <body>
                        <h3>${file.filename}</h3>
                        <p>هذا النوع من الملفات لا يمكن معاينته مباشرة</p>
                        <button onclick="window.location.href='${file.file_url}'" download="${file.filename}">
                            تحميل الملف
                        </button>
                    </body>
                    </html>
                `)
            }
        }
    }

    const handleDownloadFile = (file) => {
        if (file.file_url) {
            const link = document.createElement('a')
            link.href = file.file_url
            link.download = file.filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    const canPreviewFile = (fileType) => {
        return ['image', 'pdf'].includes(fileType)
    }

    const getFileType = (mimeType) => {
        if (mimeType.startsWith('image/')) return 'image'
        if (mimeType === 'application/pdf') return 'pdf'
        if (mimeType.startsWith('video/')) return 'video'
        if (mimeType.startsWith('audio/')) return 'audio'
        if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'présentation'
        if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'tableur'
        if (mimeType.includes('document') || mimeType.includes('word')) return 'document'
        if (mimeType.includes('text/')) return 'document'
        if (mimeType.includes('zip') || mimeType.includes('rar')) return 'archive'
        return 'autre'
    }

    const removeFile = (index) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    }

    const getFileIcon = (fileType) => {
        const icons = {
            document: '📄',
            image: '🖼️',
            présentation: '📊',
            tableur: '📈',
            pdf: '📑',
            video: '🎬',
            audio: '🎵',
            archive: '📦',
            autre: '📎'
        }
        return icons[fileType] || '📎'
    }

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 Bytes'
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(1024))
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    }

    // ✅ CORRECTION AMÉLIORÉE : SOUMISSION DU FORMULAIRE
    const handleSubmit = async (e) => {
        e.preventDefault()
        
        console.log('🚀 Soumission du formulaire:', formData)
        console.log('📝 Mode:', activityToEdit ? 'Édition' : 'Création')
        console.log('👥 Utilisateurs sélectionnés:', selectedUsers)
        console.log('📁 Fichiers uploadés:', uploadedFiles)
        
        if (!validateForm()) {
            alert('يرجى تصحيح الأخطاء في النموذج')
            return
        }

        // Validation des dates
        if (new Date(formData.start_date) > new Date(formData.end_date)) {
            alert('يجب أن يكون تاريخ البداية قبل تاريخ النهاية')
            return
        }

        if (formData.start_date === formData.end_date && formData.start_time >= formData.end_time) {
            alert('يجب أن يكون وقت البداية قبل وقت النهاية في نفس اليوم')
            return
        }

        setIsSubmitting(true)

        try {
            // ✅ PRÉPARATION COMPLÈTE DES DONNÉES
            const activityData = {
                activity_subject: formData.activity_subject,
                general_activity: formData.general_activity,
                activity_type: formData.activity_type,
                description: formData.description,
                notes: formData.notes,
                visibility: formData.visibility,
                start_date: formData.start_date,
                start_time: formData.start_time,
                end_date: formData.end_date,
                end_time: formData.end_time,
                // ✅ CORRECTION CRITIQUE : Envoyer les utilisateurs identifiés SEULEMENT pour "مستخدمين محددين"
                identified_users_ids: formData.visibility === 'مستخدمين محددين' 
                    ? selectedUsers.map(user => user._id || user.user?._id).filter(id => id)
                    : [],
                uploads: uploadedFiles.map(file => ({
                    filename: file.filename,
                    file_url: file.file_url,
                    file_type: file.file_type,
                    file_size: file.file_size,
                    upload_date: file.upload_date
                }))
            }
            
            console.log('📤 DONNÉES ACTIVITÉ COMPLÈTES ENVOYÉES:', activityData)
            
            let result
            if (activityToEdit) {
                // ✅ MODE MODIFICATION
                console.log('✏️ Mise à jour de l\'activité:', activityToEdit._id)
                result = await dispatch(updateActivity(activityToEdit._id, activityData))
            } else {
                // ✅ MODE CRÉATION
                console.log('🆕 Création d\'une nouvelle activité')
                result = await dispatch(createActivity(activityData))
            }

            if (result) {
                console.log('✅ Succès de l\'opération')
                // Fermer le modal
                onHide()
                // Reset du formulaire
                resetForm()
                // Appeler le callback de succès si fourni
                if (onSuccess && typeof onSuccess === 'function') {
                    onSuccess()
                }
            } else {
                alert('❌ فشل في حفظ النشاط. يرجى المحاولة مرة أخرى.')
            }
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error)
            alert('❌ حدث خطأ أثناء حفظ النشاط: ' + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    // ✅ FONCTION POUR FERMER ET RÉINITIALISER
    const handleClose = () => {
        resetForm()
        onHide()
    }

    // ✅ OPTIONS POUR LES TYPES D'ACTIVITÉS
    const generalActivityOptions = [
        'اجتماع', 'تدريب', 'مهمة', 'عمل عن بعد', 'تقرير', 
        'تحليل', 'عرض', 'تدقيق', 'تخطيط', 'تقييم', 
        'مقابلة', 'عمل مكتب', 'حدث', 'أخرى'
    ]

    const activityTypeOptions = {
        'اجتماع': ['اجتماع داخلي', 'اجتماع خارجي'],
        'تدريب': ['تدريب داخلي', 'تدريب خارجي'],
        'مهمة': ['مهمة ميدانية', 'مهمة إدارية'],
        'عمل عن بعد': ['عمل عن بعد'],
        'تقرير': ['كتابة تقرير'],
        'تحليل': ['تحليل البيانات'],
        'عرض': ['عرض داخلي', 'عرض خارجي'],
        'تدقيق': ['تدقيق داخلي', 'تدقيق خارجي'],
        'تخطيط': ['تخطيط مشروع', 'تخطيط فريق'],
        'تقييم': ['تقييم أداء', 'تقييم مشروع'],
        'مقابلة': ['مقابلة فردية', 'مقابلة جماعية'],
        'عمل مكتب': ['عمل مكتب'],
        'حدث': ['حدث مؤسسي', 'حدث مهني'],
        'أخرى': ['أخرى']
    }

    const getActivityTypeOptions = () => {
        return activityTypeOptions[formData.general_activity] || []
    }

    // ✅ FONCTIONS DE TRADUCTION
    const getActivityTypeLabel = (type) => {
        const labels = {
            'اجتماع داخلي': 'اجتماع داخلي',
            'اجتماع خارجي': 'اجتماع خارجي',
            'تدريب داخلي': 'تدريب داخلي',
            'تدريب خارجي': 'تدريب خارجي',
            'مهمة ميدانية': 'مهمة ميدانية',
            'مهمة إدارية': 'مهمة إدارية',
            'عمل عن بعد': 'عمل عن بعد',
            'كتابة تقرير': 'كتابة تقرير',
            'تحليل البيانات': 'تحليل البيانات',
            'عرض داخلي': 'عرض داخلي',
            'عرض خارجي': 'عرض خارجي',
            'تدقيق داخلي': 'تدقيق داخلي',
            'تدقيق خارجي': 'تدقيق خارجي',
            'تخطيط مشروع': 'تخطيط مشروع',
            'تخطيط فريق': 'تخطيط فريق',
            'تقييم أداء': 'تقييم أداء',
            'تقييم مشروع': 'تقييم مشروع',
            'مقابلة فردية': 'مقابلة فردية',
            'مقابلة جماعية': 'مقابلة جماعية',
            'عمل مكتب': 'عمل مكتب',
            'حدث مؤسسي': 'حدث مؤسسي',
            'حدث مهني': 'حدث مهني',
            'أخرى': 'أخرى'
        }
        return labels[type] || type
    }

    const getGeneralActivityLabel = (activity) => {
        const labels = {
            'اجتماع': 'اجتماع',
            'تدريب': 'تدريب',
            'مهمة': 'مهمة',
            'عمل عن بعد': 'عمل عن بعد',
            'تقرير': 'تقرير',
            'تحليل': 'تحليل',
            'عرض': 'عرض',
            'تدقيق': 'تدقيق',
            'تخطيط': 'تخطيط',
            'تقييم': 'تقييم',
            'مقابلة': 'مقابلة',
            'عمل مكتب': 'عمل مكتب',
            'حدث': 'حدث',
            'أخرى': 'أخرى'
        }
        return labels[activity] || activity
    }

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static" dir="rtl">
            <Modal.Header closeButton className="activity-modal-header">
                <Modal.Title>
                    {activityToEdit ? '✏️ تعديل النشاط' : '➕ نشاط جديد'}
                    {activityToEdit && formData.activity_subject && (
                        <span className="ms-2">: {formData.activity_subject}</span>
                    )}
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {activityState.error && (
                        <Alert variant="danger" className="mb-3">
                            {activityState.error}
                        </Alert>
                    )}

                    {/* DEBUG - Afficher les données actuelles */}
                    {activityToEdit && (
                        <Alert variant={isInitialized ? "success" : "warning"} className="mb-3">
                            <small>
                                <strong>وضع التعديل:</strong> 
                                <br />- ✅ النشاط: {formData.general_activity || 'غير محدد'}
                                <br />- ✅ النوع: {formData.activity_type || 'غير محدد'}
                                <br />- ✅ الموضوع: {formData.activity_subject || 'غير محدد'}
                                <br />- ✅ التاريخ: {formData.start_date || 'غير محدد'} إلى {formData.end_date || 'غير محدد'}
                                <br />- ✅ الوقت: {formData.start_time || 'غير محدد'} - {formData.end_time || 'غير محدد'}
                                <br />- ✅ المستخدمون: {selectedUsers.length}
                                <br />- ✅ الملفات: {uploadedFiles.length}
                                <br />- 🔧 الحالة: {isInitialized ? 'تم التهيئة' : 'جاري التهيئة...'}
                            </small>
                        </Alert>
                    )}

                    {/* Section 1: Type d'activité */}
                    <div className="form-section">
                        <h5 className="section-title">نوع النشاط</h5>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>النشاط العام *</Form.Label>
                                    <Form.Select
                                        name="general_activity"
                                        value={formData.general_activity}
                                        onChange={handleGeneralActivityChange}
                                        isInvalid={!!errors.general_activity}
                                    >
                                        <option value="">اختر النشاط العام</option>
                                        {generalActivityOptions.map(activity => (
                                            <option key={activity} value={activity}>
                                                {getGeneralActivityLabel(activity)}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.general_activity}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>نوع النشاط *</Form.Label>
                                    <Form.Select
                                        name="activity_type"
                                        value={formData.activity_type}
                                        onChange={handleChange}
                                        isInvalid={!!errors.activity_type}
                                        disabled={!formData.general_activity}
                                    >
                                        <option value="">اختر نوع النشاط</option>
                                        {getActivityTypeOptions().map(type => (
                                            <option key={type} value={type}>
                                                {getActivityTypeLabel(type)}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.activity_type}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Section 2: Dates et heures */}
                    <div className="form-section">
                        <h5 className="section-title">التواريخ والأوقات</h5>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>تاريخ البداية *</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        isInvalid={!!errors.start_date}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.start_date}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>وقت البداية *</Form.Label>
                                    <Form.Control
                                        type="time"
                                        name="start_time"
                                        value={formData.start_time}
                                        onChange={handleChange}
                                        isInvalid={!!errors.start_time}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.start_time}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>تاريخ النهاية *</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        isInvalid={!!errors.end_date}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.end_date}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>وقت النهاية *</Form.Label>
                                    <Form.Control
                                        type="time"
                                        name="end_time"
                                        value={formData.end_time}
                                        onChange={handleChange}
                                        isInvalid={!!errors.end_time}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.end_time}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Section 3: Détails de l'activité */}
                    <div className="form-section">
                        <h5 className="section-title">تفاصيل النشاط</h5>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>موضوع النشاط *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="activity_subject"
                                        value={formData.activity_subject}
                                        onChange={handleChange}
                                        isInvalid={!!errors.activity_subject}
                                        placeholder="أدخل موضوع النشاط"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.activity_subject}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>وصف مفصل</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="أدخل وصف النشاط"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>ملاحظات إضافية</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="أدخل أي ملاحظات إضافية"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Section 4: Upload de fichiers */}
                    <div className="form-section">
                        <h5 className="section-title">الملفات المرفقة</h5>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>إضافة ملفات</Form.Label>
                                    <div className="file-upload-area">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            multiple
                                            accept="*/*"
                                            className="file-input"
                                            id="file-upload"
                                        />
                                        <label htmlFor="file-upload" className="file-upload-label">
                                            <div className="upload-icon">📎</div>
                                            <div className="upload-text">
                                                <div>انقر لاختيار الملفات</div>
                                                <small className="text-muted">جميع أنواع الملفات مسموحة</small>
                                            </div>
                                        </label>
                                    </div>
                                    
                                    {isUploading && (
                                        <div className="uploading-files">
                                            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                            جاري تحضير الملفات...
                                        </div>
                                    )}

                                    {uploadedFiles.length > 0 && (
                                        <div className="uploaded-files mt-3">
                                            <h6>الملفات المرفقة ({uploadedFiles.length}):</h6>
                                            <div className="files-list">
                                                {uploadedFiles.map((file, index) => (
                                                    <div key={index} className={`file-item ${file.file_type}`}>
                                                        <div className="file-info">
                                                            <span className="file-icon">{getFileIcon(file.file_type)}</span>
                                                            <div className="file-details">
                                                                <div className="file-name">{file.filename}</div>
                                                                <div className="file-meta">
                                                                    {formatFileSize(file.file_size)} • {file.file_type} • {new Date(file.upload_date).toLocaleDateString('ar-AR')}
                                                                </div>
                                                            </div>
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
                                                                onClick={() => handleDownloadFile(file)}
                                                                className="download-btn"
                                                                title="تحميل الملف"
                                                            >
                                                                ⬇️ تحميل
                                                            </Button>
                                                            
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => removeFile(index)}
                                                                className="remove-file-btn"
                                                                title="حذف الملف"
                                                            >
                                                                ✕ حذف
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Section 5: Paramètres de confidentialité */}
                    <div className="form-section">
                        <h5 className="section-title">إعدادات الخصوصية</h5>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>مستوى الخصوصية</Form.Label>
                                    <Form.Select 
                                        name="visibility"
                                        value={formData.visibility}
                                        onChange={handleChange}
                                    >
                                        <option value="خاص">خاص</option>
                                        <option value="عام">عام</option>
                                        <option value="مستخدمين محددين">مستخدمين محددين</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        {formData.visibility === 'مستخدمين محددين' && (
                            <Row>
                                <Col md={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>المستخدمون المحددون</Form.Label>
                                        <div className="mb-2">
                                            <Button 
                                                variant="outline-primary" 
                                                onClick={() => setShowUserSelector(true)}
                                                size="sm"
                                                type="button"
                                                disabled={loadingUsers}
                                            >
                                                {loadingUsers ? 'جاري التحميل...' : '+ تحديد المستخدمين'}
                                            </Button>
                                        </div>
                                        
                                        {selectedUsers.length > 0 && (
                                            <div className="selected-users">
                                                <h6>المستخدمون المحددون ({selectedUsers.length}):</h6>
                                                <div className="users-list">
                                                    {selectedUsers.map(user => (
                                                        <div key={user._id} className="user-tag">
                                                            <Avatar 
                                                                src={user.profile_picture} 
                                                                alt={user.name}
                                                                className="user-avatar-tag"
                                                                size="sm"
                                                            />
                                                            <div className="user-info-tag">
                                                                <div className="user-name-tag">{user.name}</div>
                                                                <div className="user-career-tag">
                                                                    {getUserPosition(user)}
                                                                </div>
                                                            </div>
                                                            <Button 
                                                                variant="outline-danger" 
                                                                size="sm"
                                                                onClick={() => removeSelectedUser(user._id)}
                                                                className="ms-2 remove-user-btn"
                                                                type="button"
                                                            >
                                                                ✕
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        إلغاء
                    </Button>
                    <Button 
                        variant="primary" 
                        type="submit"
                        disabled={isSubmitting || !isInitialized}
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                {activityToEdit ? 'جاري التحديث...' : 'جاري الإنشاء...'}
                            </>
                        ) : (
                            activityToEdit ? '💾 حفظ التغييرات' : '🆕 إنشاء النشاط'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>

            {/* Modal pour sélection des utilisateurs */}
            <Modal show={showUserSelector} onHide={() => setShowUserSelector(false)} size="xl" dir="rtl">
                <Modal.Header closeButton>
                    <Modal.Title>
                        تحديد المستخدمين المعنيين
                        <small className="text-muted ms-2">({filteredUsers.length} مستخدم)</small>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="users-selection">
                        <div className="search-section mb-3">
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="البحث بالاسم أو المنصب..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                                <InputGroup.Text>🔍</InputGroup.Text>
                                {searchTerm && (
                                    <Button variant="outline-secondary" onClick={resetSearch}>
                                        ✕
                                    </Button>
                                )}
                            </InputGroup>
                            {searchTerm && (
                                <div className="search-info mt-2">
                                    <small className="text-muted">
                                        {filteredUsers.length} نتيجة وجدت لـ "{searchTerm}"
                                    </small>
                                </div>
                            )}
                        </div>

                        {loadingUsers ? (
                            <div className="text-center py-3">
                                <div className="spinner-border" role="status"></div>
                                <div>جاري تحميل المستخدمين...</div>
                            </div>
                        ) : filteredUsers && filteredUsers.length > 0 ? (
                            <div className="users-grid">
                                {filteredUsers.map(user => (
                                    <div key={user._id} className="user-selection-item">
                                        <Form.Check
                                            type="checkbox"
                                            id={`user-${user._id}`}
                                            checked={selectedUsers.some(u => u._id === user._id)}
                                            onChange={() => handleUserSelection(user)}
                                            label={
                                                <div className="user-info-display">
                                                    <Avatar 
                                                        src={user.profile_picture} 
                                                        alt={user.name}
                                                        className="user-avatar-selection"
                                                        size="sm"
                                                    />
                                                    <div className="user-details-selection">
                                                        <div className="user-name-selection">{user.name}</div>
                                                        <div className="user-career-selection">
                                                            {getUserPosition(user)}
                                                        </div>
                                                        {user.email && (
                                                            <div className="user-email-selection">
                                                                <small>{user.email}</small>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-3 text-muted">
                                {searchTerm ? 'لم يتم العثور على مستخدمين لبحثك' : 'لا يوجد مستخدمون متاحون'}
                            </div>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <div>
                        <strong>{selectedUsers.length}</strong> مستخدم محدد
                    </div>
                    <div>
                        <Button variant="outline-secondary" onClick={resetSearch} className="me-2">
                            إعادة تعيين
                        </Button>
                        <Button variant="primary" onClick={() => setShowUserSelector(false)}>
                            تأكيد الاختيار
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </Modal>
    )
}

export default ActivityForm