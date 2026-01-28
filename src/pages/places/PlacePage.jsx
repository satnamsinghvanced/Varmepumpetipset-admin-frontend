import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiTwotoneEdit } from "react-icons/ai";
import { RiDeleteBin5Line } from "react-icons/ri";
import { LuFileUp, LuPlus } from "react-icons/lu";
import { FaRegEye } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../UI/pagination";
import { ROUTES } from "../../consts/routes";
import {
  getPlaces,
  importPlaces,
  deletePlace,
} from "../../store/slices/placeSlice";

export const Places = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { places, loading, error } = useSelector((state) => state.places);
  const getInitialPage = () => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam, 10) || 1 : 1;
  };

  const [page, setPage] = useState(getInitialPage);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [placeToDelete, setPlaceToDelete] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [showUploadingFileLoader, setShowUploadingFileLoader] = useState(false);
  const [search, setSearch] = useState("");

  const fetchPlaces = useCallback(async () => {
    try {
      const res = await dispatch(getPlaces({ page, limit, search })).unwrap();
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
  }, [dispatch, page, limit, search]);

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
    fetchPlaces();
  }, [fetchPlaces]);

  const handleDeletePlace = async () => {
    if (!placeToDelete) return;
    try {
      const res = await dispatch(deletePlace(placeToDelete._id)).unwrap();
      toast.success(res.message || "Place deleted");
      setShowDeleteModal(false);
      fetchPlaces();
    } catch (err) {
      console.error("Failed to delete:", err);
      toast.error("Failed to delete");
    }
  };

  const isValidFileExtension = (file) => {
    if (!file) return false;
    const fileName = file.name.toLowerCase();
    return fileName.endsWith(".csv") || fileName.endsWith(".xlsx");
  };

  const handleImportPlaces = useCallback(async () => {
    if (!uploadFile) return toast.error("Select a file first");

    setShowUploadingFileLoader(true);
    const formData = new FormData();
    formData.append("csv", uploadFile);

    try {
      const result = await dispatch(importPlaces(formData)).unwrap();
      const { placesInserted, placesSkipped } = result;

      if (placesInserted > 0 && placesSkipped === 0) {
        toast.success(`Import successful! ${placesInserted} records created.`);
      } else if (placesInserted > 0 && placesSkipped > 0) {
        toast.warn(
          `Import successful with mixed results. ${placesInserted} inserted, ${placesSkipped} skipped.`,
        );
      } else if (placesInserted === 0 && placesSkipped > 0) {
        toast.info(`${placesSkipped} records skipped due to duplicates.`);
      } else {
        toast.info("Import completed, no records processed.");
      }

      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchPlaces();
    } catch (err) {
      console.error("Import failed:", err);
      toast.error("Import failed");
    } finally {
      setShowUploadingFileLoader(false);
    }
  }, [uploadFile, dispatch, fetchPlaces]);

  useEffect(() => {
    if (uploadFile) handleImportPlaces();
  }, [uploadFile, handleImportPlaces]);

  const headerButtons = [
    {
      value: showUploadingFileLoader ? "Uploading..." : "Import",
      variant: "white",
      icon: showUploadingFileLoader ? (
        <div className="h-4 w-4 animate-spin border-2 border-slate-400 border-t-transparent rounded-full" />
      ) : (
        <LuFileUp size={18} />
      ),
      disabled: showUploadingFileLoader,
      className:
        "border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed",
      onClick: () => {
        if (!showUploadingFileLoader) fileInputRef.current.click();
      },
    },
    {
      value: "Add Place",
      variant: "primary",
      icon: <LuPlus size={18} />,
      className:
        "!bg-primary !text-white !border-primary hover:!bg-secondary hover:!border-secondary",
      onClick: () => navigate(ROUTES.PLACES_CREATE),
    },
  ];

  const totalPlaces = places?.data?.length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Places"
        description="Manage places and related information."
        buttonsList={headerButtons}
      />

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".csv, .xlsx"
        onChange={(e) => {
          const selectedFile = e.target.files[0];
          if (selectedFile) {
            if (isValidFileExtension(selectedFile)) setUploadFile(selectedFile);
            else {
              toast.error("Invalid file type. Only CSV and XLSX allowed.");
              e.target.value = "";
              setUploadFile(null);
            }
          }
        }}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-4 gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Places overview
            </p>
            <p className="text-xs text-slate-500">
              {loading ? "Loading..." : `${totalPlaces} items`}
            </p>
          </div>

          <input
            type="text"
            placeholder="Search places..."
            value={search}
            onChange={(e) => {
              setPage(1); // Reset to first page
              setSearch(e.target.value);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Place Name</th>
                <th className="px-6 py-3">Slug</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Description</th>
                {/* <th className="px-6 py-3">Recommended</th> */}
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-600">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((__, idx) => (
                      <td key={idx} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-6 text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : totalPlaces > 0 ? (
                places.data.map((place, index) => (
                  <tr key={place._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {place.name}
                    </td>
                    <td className="px-6 py-4">{place.slug}</td>
                    <td className="px-6 py-4">
                      {place.title?.length > 20
                        ? place.title.slice(0, 20) + "..."
                        : place.title}
                    </td>
                    <td className="px-6 py-4 line-clamp-1 break-words">
                      {place.description}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-900"
                          onClick={() =>
                            navigate(`/place/${place._id}?page=${page}`)
                          }
                          title="Preview"
                        >
                          <FaRegEye size={16} />
                        </button>
                        <button
                          className="rounded-full border p-2 text-slate-500 hover:text-slate-900"
                          onClick={() =>
                            navigate(`/place/${place._id}/Edit?page=${page}`)
                          }
                        >
                          <AiTwotoneEdit size={16} />
                        </button>
                        <button
                          className="rounded-full border border-red-200 p-2 text-red-500 hover:bg-red-50"
                          onClick={() => {
                            setPlaceToDelete(place);
                            setShowDeleteModal(true);
                          }}
                        >
                          <RiDeleteBin5Line size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-6 text-center text-slate-500"
                  >
                    No places found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPlaces > 0 && (
          <div className="px-6 py-4">
            <Pagination totalPages={totalPages} page={page} setPage={setPage} />
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl">
            <p className="text-center mb-6 text-lg font-semibold">
              Are you sure you want to delete this place?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 border rounded-full"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-full"
                onClick={handleDeletePlace}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Places;
