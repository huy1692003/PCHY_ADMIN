import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { Panel } from 'primereact/panel';
import { HT_QUYEN_NGUOIDUNG_Service } from '../../../services/HT_QUYEN_NGUOIDUNG';
import { HT_NHOM_QUYEN_Service } from '../../../services/HT_NHOM_QUYENService';

const PhanQuyen = () => {
    const [quyenNguoiDung, setQuyenNguoiDung] = useState([]);
    const [dataDVIQLY, setDataDVIQLY] = useState([]);
    const [dataNhomQuyen, setDataNhomQuyen] = useState([]);
    const [visibleDialog, setVisibleDialog] = useState(false);
    const [selectedNguoiDung, setSelectedNguoiDung] = useState([]);
    const [selectedDVIQLY, setSelectedDVIQLY] = useState(null);
    const [selectedNhomQuyen, setSelectedNhomQuyen] = useState(null);
    const [searchUsername, setSearchUsername] = useState('');  // Added state for username search
    const [searchFullName, setSearchFullName] = useState('');  // Added state for full name search
    const toast = useRef(null);

    useEffect(() => {
        const getNhomQuyen = async () => {
            let res = await HT_NHOM_QUYEN_Service.getQuyen_byDVIQLY(selectedDVIQLY);
            res && setDataNhomQuyen(res.map((d) => ({ label: d.teN_NHOM, value: d.nhoM_ID })));
        };
        selectedDVIQLY && getNhomQuyen();
    }, [selectedDVIQLY]);

    useEffect(() => {
        loadPermission();
        getDVIQLY();
    }, []);

    const getDVIQLY = async () => {
        let res = await HT_NHOM_QUYEN_Service.getDVIQLY();
        res && setDataDVIQLY(res.map((d) => ({ label: d.teN_DVIQLY, value: d.mA_DVIQLY })));
    };

    // Load danh sách quyền người dùng
    const loadPermission = async () => {
        const res = await HT_QUYEN_NGUOIDUNG_Service.get();
        res && setQuyenNguoiDung(res);
    };

    // Search function to filter user list based on Tên đăng nhập and Họ tên
    const onSearch = () => {
        let filteredUsers = quyenNguoiDung.filter((user) => {
            return (
                (searchUsername === '' || user.tenDangNhap.toLowerCase().includes(searchUsername.toLowerCase())) &&
                (searchFullName === '' || user.tenNguoiDung.toLowerCase().includes(searchFullName.toLowerCase()))
            );
        });
        setQuyenNguoiDung(filteredUsers);
    };

    const onUpdate = async () => {
        if (selectedNhomQuyen) {
            let res = await HT_QUYEN_NGUOIDUNG_Service.update(selectedNguoiDung.mA_NGUOI_DUNG, selectedNhomQuyen);
            if (res) {
                loadPermission();
                setSelectedDVIQLY(null);
                setSelectedNhomQuyen(null);
                toast.current.show({ severity: 'success', summary: 'Thành công!', detail: 'Phân quyền thành công.', life: 3000 });
            }
        } else {
            toast.current.show({ severity: "error", summary: 'Thất bại!', detail: 'Hãy chọn quyền cho người dùng.', life: 3000 });
        }
    };

    const onDelete = async (user) => {
        confirmDialog({
            message: `Bạn có chắc chắn muốn xóa quyền người dùng của thành viên  "${user.tenNguoiDung}" này không?`,
            header: 'Xác nhận',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                let res = await HT_QUYEN_NGUOIDUNG_Service.delete(user.id)
                res && toast.current.show({ severity: 'success', summary: 'Thành công!', detail: 'Xóa quyền thành công.', life: 3000 });
                loadPermission()
            }
        });
    };

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className='border-round-3xl bg-white p-4 text-lg'>
                <Panel header="Tìm kiếm">
                    <div className='flex flex-wrap p-fluid gap-3'>
                        {/* <div className='field w-5'>
                            <label>Tên đăng nhập</label>
                            <InputText value={searchUsername} onChange={(e) => setSearchUsername(e.target.value)} style={{ width: '100%' }} />
                        </div> */}
                        <div className='field w-5'>
                            <label>Tìm theo họ tên</label>
                            <InputText value={searchFullName} placeholder='Nhập tên người dùng' onChange={(e) => setSearchFullName(e.target.value)} style={{ width: '100%' }} />
                        </div>
                    </div>
                    <div className='flex justify-content-center mt-2'>
                        <Button label='Tìm kiếm' style={{ backgroundColor: '#1445a7' }} onClick={onSearch} />
                    </div>
                </Panel>

                <Panel header={<h4>Danh sách quyền người dùng</h4>} className='mt-3'>
                    <DataTable value={quyenNguoiDung} showGridlines paginator rows={10} style={{ fontSize: 12 }} rowsPerPageOptions={[5, 10, 25, 50, 100]}>
                        <Column header="STT" body={(_, { rowIndex }) => rowIndex + 1} className='w-1rem' />
                        <Column field="tenNguoiDung" header="Họ tên" className="w-3" />
                        <Column field="tenDonVi" header="Tên Đơn vị" className="w-3" />
                        <Column field="tenNhom" header="Nhóm quyền" className="w-4" />
                        <Column header="Thao tác" style={{ width: 100 }} body={(rowData) => (
                            <span className="flex w-1">
                                <Button size='small' className="w-1rem h-2rem p-3 mr-1" style={{ backgroundColor: "#1146A6" }} icon="pi pi-user-edit"
                                    onClick={() => {
                                        setSelectedNguoiDung(rowData);
                                        setVisibleDialog(true);
                                    }} />
                                <Button size='small' className="w-1rem h-2rem p-3 mr-1 p-button-danger" icon="pi pi-trash"
                                    onClick={() => {
                                        onDelete(rowData);
                                    }} />
                            </span>
                        )} />
                    </DataTable>
                </Panel>

                <Dialog className='w-6' header={<h4>Sửa quyền người dùng</h4>} visible={visibleDialog} onHide={() => setVisibleDialog(false)}>
                    <Panel header="Thông tin người dùng" className='mb-2 '>
                        <DataTable value={[selectedNguoiDung]} showGridlines style={{ fontSize: 12 }} >
                            <Column field="tenNguoiDung" header="Họ tên" className="w-4" />
                            <Column field="tenNhom" header="Nhóm quyền hiện tại" className="w-4" />
                            <Column field="tenDonVi" header="Tên Đơn vị" className="w-5" />
                        </DataTable>
                    </Panel>
                    <Panel header="Chọn quyền mới">
                        <div className="flex justify-content-between ">
                            <Dropdown value={selectedDVIQLY} onChange={(e) => setSelectedDVIQLY(e.value)}
                                options={dataDVIQLY}
                                filter className="md:w-6 w-full mt-2" placeholder="-- Đơn vị quản lý -- " />
                            <Dropdown value={selectedNhomQuyen} onChange={(e) => setSelectedNhomQuyen(e.value)} options={dataNhomQuyen}
                                filter className="md:w-5 w-full mt-2" placeholder="-- Nhóm Quyền -- " />
                        </div>
                    </Panel>
                    <div className='flex justify-content-end gap-2 mt-4'>
                        <Button label="Hủy" icon="pi pi-times" onClick={() => setVisibleDialog(false)} className='p-button-outlined' />
                        <Button label="Lưu lại" icon="pi pi-check" onClick={onUpdate} />
                    </div>
                </Dialog>
            </div>
        </>
    );
};

export default PhanQuyen;
