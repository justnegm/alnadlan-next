import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
interface paginationProps {
    page: number
    setPage: (page: number) => void
    count: number
}
const ListPagination = ({ page, setPage, count }: paginationProps) => {
    const totalPages = Math.ceil(count / 16) || 1;
    if (count === 0) return null
    return (
        <Pagination>
            <PaginationContent>

                <PaginationItem>
                    <PaginationPrevious
                        onClick={() => page > 1 && setPage(page - 1)}
                    />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                        <PaginationLink
                            onClick={() => setPage(i + 1)}
                            isActive={page === i + 1}
                            className={page === i + 1 ? 'bg-[#08182D] text-white rounded-full w-10 h-10' : ''}
                        >
                            {i + 1}
                        </PaginationLink>
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext
                        onClick={() => page < totalPages && setPage(page + 1)}
                    />
                </PaginationItem>

            </PaginationContent>
        </Pagination>
    )
}

export default ListPagination