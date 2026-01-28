import { useEffect, useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "react-toastify";
import PageHeader from "../../components/PageHeader";
import {
  deleteContact,
  fetchContacts,
} from "../../store/slices/contactUsSlice";
import ConfirmModal from "../../UI/ConfirmDeleteModal";
import Pagination from "../../UI/pagination";

const ContactUsListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const contactState = useSelector((state) => state.contact);
  const { data, loading } = contactState;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const entries = data?.items || [];
  const total = data?.total || 0;

  const getInitialPage = () => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam, 10) || 1 : 1;
  };

  const [page, setPage] = useState(getInitialPage);
  const limit = 10;

  useEffect(() => {
    const pageParam = searchParams.get("page");
    const newPage = pageParam ? parseInt(pageParam, 10) || 1 : 1;
    if (newPage !== page) {
      setPage(newPage);
    }
  }, [searchParams]);

  useEffect(() => {
    const pageParam = searchParams.get("page");
    const currentPageInUrl = pageParam ? parseInt(pageParam, 10) || 1 : 1;
    if (page !== currentPageInUrl) {
      if (page > 1) {
        setSearchParams({ page: page.toString() });
      } else {
        setSearchParams({});
      }
    }
  }, [page, searchParams, setSearchParams]);

  useEffect(() => {
    dispatch(fetchContacts({ page, limit }));
  }, [dispatch, page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteContact(selectedId)).unwrap();
      toast.success("Deleted successfully");
      dispatch(fetchContacts({ page, limit }));
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setModalOpen(false);
      setSelectedId(null);
    }
  };

  const handleCancelDelete = () => {
    setModalOpen(false);
    setSelectedId(null);
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Messages"
        description="View messages submitted from the Contact Us website form"
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Entries</p>
            <p className="text-xs text-slate-500">
              {loading ? "Loading..." : `${total} messages`}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-600">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(10)].map((__, j) => (
                      <td key={j} className="px-6 py-6">
                        <div className="h-4 bg-slate-200 rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-6 text-center text-slate-500"
                  >
                    No messages found
                  </td>
                </tr>
              ) : (
                entries.map((item, i) => (
                  <tr key={item._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">{(page - 1) * limit + i + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4">{item.email}</td>
                    <td className="px-6 py-4">{item.phone || "-"}</td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-center">
                        <button
                          title="View Details"
                          onClick={() =>
                            navigate(`/contact/${item._id}?page=${page}`)
                          }
                          className="rounded-full border p-2 text-slate-500 hover:text-slate-900"
                        >
                          <FaRegEye size={16} />
                        </button>

                        <button
                          title="Delete"
                          onClick={() => handleDeleteClick(item._id)}
                          className="rounded-full border border-red-200 p-2 text-red-500 hover:bg-red-50"
                        >
                          <RiDeleteBin5Line size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4">
            <Pagination totalPages={totalPages} page={page} setPage={setPage} />
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={modalOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this message?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default ContactUsListPage;
