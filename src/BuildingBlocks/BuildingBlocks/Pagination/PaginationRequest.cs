namespace BuildingBlocks.Pagination;

public class PaginationRequest(int pageIndex = 0, int pageSize = 10)
{
    public int PageIndex { get; } = pageIndex;
    public int PageSize { get; } = pageSize;
}
