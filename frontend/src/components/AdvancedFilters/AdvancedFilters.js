
//components/AdvancedFilters/AdvancedFilters.js

import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Modal, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getFilteredActivities, searchActivities } from '../../JS/actions/ActivityAction';
import './AdvancedFilters.css';

const AdvancedFilters = ({ onFiltersApplied }) => {
    const dispatch = useDispatch();
    const activity = useSelector(state => state.activityReducer);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        startDate: '',
        endDate: '',
        activityType: '',
        viewMode: 'all'
    });

    const activityTypes = [
        { value: 'اجتماع', label: 'اجتماع', icon: '👥' },
        { value: 'تدريب', label: 'تدريب', icon: '🎓' },
        { value: 'مهمة', label: 'مهمة', icon: '🎯' },
        { value: 'عمل عن بعد', label: 'عمل عن بعد', icon: '🏠' },
        { value: 'تقرير', label: 'تقرير', icon: '📄' },
        { value: 'تحليل', label: 'تحليل', icon: '📊' },
        { value: 'عرض', label: 'عرض', icon: '📢' },
        { value: 'تدقيق', label: 'تدقيق', icon: '🔍' },
        { value: 'تخطيط', label: 'تخطيط', icon: '📅' },
        { value: 'تقييم', label: 'تقييم', icon: '⭐' },
        { value: 'مقابلة', label: 'مقابلة', icon: '💼' },
        { value: 'عمل مكتب', label: 'عمل مكتب', icon: '💻' },
        { value: 'حدث', label: 'حدث', icon: '🎉' },
        { value: 'أخرى', label: 'أخرى', icon: '🔧' }
    ];

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleApplyFilters = () => {
        console.log('🟢 APPLYING FILTERS (SINGLE OR COMBINED):', filters);
        
        // ✅ CORRECTION : Préparer les paramètres avec tous les filtres
        const searchParams = {
            search: filters.search,
            activityType: filters.activityType,
            startDate: filters.startDate,
            endDate: filters.endDate,
            viewMode: filters.viewMode,
            page: 1,
            limit: 20
        };

        console.log('🔍 FILTERS PARAMS:', searchParams);

        // ✅ CORRECTION : TOUJOURS utiliser searchActivities quand on applique des filtres
        // Peu importe le nombre de filtres (1, 2, 3 ou tous)
        console.log('🎯 DISPATCHING SEARCH ACTIVITIES WITH FILTERS');
        dispatch(searchActivities(searchParams));
        
        if (onFiltersApplied) {
            onFiltersApplied(filters);
        }
        
        setShowModal(false);
    };

    const handleResetFilters = () => {
        console.log('🟢 RESETTING ALL FILTERS');
        const resetFilters = {
            search: '',
            startDate: '',
            endDate: '',
            activityType: '',
            viewMode: 'all'
        };
        
        setFilters(resetFilters);
        
        // ✅ CORRECTION : Réinitialiser en chargeant toutes les activités
        dispatch(getFilteredActivities(1, 20, { viewMode: 'all' }));
        
        if (onFiltersApplied) {
            onFiltersApplied({});
        }
        
        setShowModal(false);
    };

    const isFiltersActive = Object.values(filters).some(value => 
        value !== '' && value !== 'all'
    );

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.viewMode !== 'all') count++;
        if (filters.search) count++;
        if (filters.activityType) count++;
        if (filters.startDate) count++;
        if (filters.endDate) count++;
        return count;
    };

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const getViewModeLabel = (mode) => {
        const labels = {
            'all': 'جميع الأنشطة',
            'my': 'أنشطتي فقط',
            'identified': 'تم تحديدي فيها',
            'public': 'أنشطة عامة فقط'
        };
        return labels[mode] || mode;
    };

    // ✅ CORRECTION : Fonction pour afficher la combinaison des filtres
    const getFiltersCombinationText = () => {
        const activeFilters = [];
        
        if (filters.viewMode !== 'all') {
            activeFilters.push(`العرض: ${getViewModeLabel(filters.viewMode)}`);
        }
        if (filters.search) {
            activeFilters.push(`البحث: "${filters.search}"`);
        }
        if (filters.activityType) {
            const activityLabel = activityTypes.find(t => t.value === filters.activityType)?.label;
            activeFilters.push(`النوع: ${activityLabel}`);
        }
        if (filters.startDate && filters.endDate) {
            activeFilters.push(`الفترة: ${filters.startDate} إلى ${filters.endDate}`);
        } else if (filters.startDate) {
            activeFilters.push(`من: ${filters.startDate}`);
        } else if (filters.endDate) {
            activeFilters.push(`إلى: ${filters.endDate}`);
        }

        return activeFilters.join(' • ');
    };

    return (
        <>
            {/* Carte principale */}
            <Card className="advanced-filters-card">
                <Card.Header className="filters-card-header">
                    <div className="header-content">
                        <div className="header-icon">🔍</div>
                        <div className="header-text">
                            <h6 className="title">البحث والتصفية المتقدم</h6>
                            <p className="subtitle">استخدم فلتر واحد أو اكثر معاً</p>
                        </div>
                    </div>
                    <Button 
                        variant="primary"
                        size="sm"
                        onClick={handleOpenModal}
                        className="open-filters-modal-btn"
                    >
                        <span className="btn-icon">⚙️</span>
                        فتح خيارات البحث
                        {isFiltersActive && (
                            <Badge bg="danger" className="filters-count-badge">
                                {getActiveFiltersCount()}
                            </Badge>
                        )}
                    </Button>
                </Card.Header>
                
                {isFiltersActive && (
                    <Card.Footer className="active-filters-footer">
                        <div className="filters-status">
                            <Badge bg="warning" className="active-filters-badge">
                                ⚡ فلاتر نشطة ({getActiveFiltersCount()})
                            </Badge>
                            <div className="filters-summary">
                                <span className="filter-combination">
                                    {getFiltersCombinationText()}
                                </span>
                            </div>
                        </div>
                    </Card.Footer>
                )}
            </Card>

            {/* Modal */}
            <Modal 
                show={showModal} 
                onHide={handleCloseModal}
                size="lg"
                centered
                className="advanced-filters-modal"
                backdrop="static"
                dir="rtl"
            >
                <Modal.Header closeButton className="modal-header-custom">
                    <Modal.Title className="modal-title-custom">
                        <div className="title-content">
                            <span className="title-icon">🔍</span>
                            <div>
                                <h5>البحث والتصفية المتقدم</h5>
                                <p className="modal-subtitle">استخدم فلتر واحد أو اكثر معاً للعثور على الأنشطة</p>
                            </div>
                        </div>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="modal-body-custom">
                    <div className="filters-container">
                        {/* Section Mode de vue */}
                        <div className="filter-section view-mode-section">
                            <div className="section-header">
                                <span className="section-icon">👁️</span>
                                <h6>عرض الأنشطة</h6>
                            </div>
                            <Form.Group className="mb-4">
                                <Form.Label className="form-label-custom">اختر طريقة عرض الأنشطة</Form.Label>
                                <Form.Select
                                    value={filters.viewMode}
                                    onChange={(e) => handleFilterChange('viewMode', e.target.value)}
                                    className="select-custom"
                                    dir="rtl"
                                >
                                    <option value="all">👁️ جميع الأنشطة</option>
                                    <option value="my">👤 أنشطتي فقط</option>
                                    <option value="identified">🎯 تم تحديدي فيها</option>
                                    <option value="public">🌍 أنشطة عامة فقط</option>
                                </Form.Select>
                                <Form.Text className="input-help-text">
                                    يمكن استخدام هذا الفلتر وحده أو مع فلاتر أخرى
                                </Form.Text>
                            </Form.Group>
                        </div>

                        {/* Section Recherche rapide */}
                        <div className="filter-section search-section">
                            <div className="section-header">
                                <span className="section-icon">🔎</span>
                                <h6>البحث السريع</h6>
                            </div>
                            <Form.Group className="mb-4">
                                <Form.Label className="form-label-custom">ابحث في النشاطات</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="ابحث في: عنوان النشاط، اسم المستخدم، التخصص..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="search-input-custom"
                                    dir="rtl"
                                />
                                <Form.Text className="input-help-text">
                                    ✅ ابحث في: <strong>عنوان النشاط</strong>، <strong>اسم المستخدم</strong>، <strong>التخصص/المنصب</strong>
                                </Form.Text>
                            </Form.Group>
                        </div>

                        {/* Section Type d'activité */}
                        <div className="filter-section type-section">
                            <div className="section-header">
                                <span className="section-icon">🎯</span>
                                <h6>نوع النشاط</h6>
                            </div>
                            <Form.Group className="mb-4">
                                <Form.Label className="form-label-custom">اختر نوع النشاط</Form.Label>
                                <Form.Select
                                    value={filters.activityType}
                                    onChange={(e) => handleFilterChange('activityType', e.target.value)}
                                    className="select-custom"
                                    dir="rtl"
                                >
                                    <option value="">🎯 جميع أنواع الأنشطة</option>
                                    {activityTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.icon} {type.label}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Text className="input-help-text">
                                    اختر نوع محدد من الأنشطة للتصفية
                                </Form.Text>
                            </Form.Group>
                        </div>

                        {/* Section Date */}
                        <div className="filter-section date-section">
                            <div className="section-header">
                                <span className="section-icon">📅</span>
                                <h6>الفترة الزمنية</h6>
                            </div>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="form-label-custom">تاريخ البداية</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={filters.startDate}
                                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                            className="date-input-custom"
                                            dir="rtl"
                                        />
                                        <Form.Text className="input-help-text">
                                            من تاريخ
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="form-label-custom">تاريخ النهاية</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={filters.endDate}
                                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                            className="date-input-custom"
                                            dir="rtl"
                                        />
                                        <Form.Text className="input-help-text">
                                            إلى تاريخ
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        {/* Aperçu des filtres actifs */}
                        {isFiltersActive && (
                            <div className="active-filters-preview">
                                <div className="section-header">
                                    <span className="section-icon">⚡</span>
                                    <h6>الفلاتر المطبقة</h6>
                                </div>
                                <div className="filters-combination">
                                    <div className="combination-text">
                                        <strong>التصفية النهائية:</strong> {getFiltersCombinationText()}
                                    </div>
                                    <div className="filters-chips">
                                        {filters.viewMode !== 'all' && (
                                            <Badge bg="primary" className="filter-chip view-chip">
                                                👁️ {getViewModeLabel(filters.viewMode)}
                                            </Badge>
                                        )}
                                        {filters.search && (
                                            <Badge bg="success" className="filter-chip search-chip">
                                                🔍 {filters.search}
                                            </Badge>
                                        )}
                                        {filters.activityType && (
                                            <Badge bg="warning" className="filter-chip type-chip">
                                                🎯 {activityTypes.find(t => t.value === filters.activityType)?.label}
                                            </Badge>
                                        )}
                                        {filters.startDate && (
                                            <Badge bg="info" className="filter-chip date-chip">
                                                📅 من: {filters.startDate}
                                            </Badge>
                                        )}
                                        {filters.endDate && (
                                            <Badge bg="info" className="filter-chip date-chip">
                                                📅 إلى: {filters.endDate}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal.Body>

                <Modal.Footer className="modal-footer-custom">
                    <div className="footer-actions">
                        <div className="primary-actions">
                            <Button 
                                variant="primary" 
                                onClick={handleApplyFilters}
                                disabled={activity.loadActivity}
                                className="action-btn apply-btn"
                            >
                                {activity.loadActivity ? (
                                    <>
                                        <span className="btn-icon">⏳</span>
                                        جاري التطبيق...
                                    </>
                                ) : (
                                    <>
                                        <span className="btn-icon">✅</span>
                                        تطبيق الفلاتر
                                        {isFiltersActive && (
                                            <Badge bg="light" text="dark" className="ms-2">
                                                {getActiveFiltersCount()}
                                            </Badge>
                                        )}
                                    </>
                                )}
                            </Button>
                            <Button 
                                variant="outline-secondary" 
                                onClick={handleCloseModal}
                                className="action-btn cancel-btn"
                            >
                                <span className="btn-icon">✖️</span>
                                إلغاء
                            </Button>
                        </div>
                        <Button 
                            variant="outline-danger" 
                            onClick={handleResetFilters}
                            disabled={activity.loadActivity}
                            className="action-btn reset-btn"
                        >
                            <span className="btn-icon">🔄</span>
                            إعادة التعيين
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AdvancedFilters;