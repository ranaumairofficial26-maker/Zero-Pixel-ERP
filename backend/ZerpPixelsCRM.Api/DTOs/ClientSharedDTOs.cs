namespace ZerpPixelsCRM.Api.DTOs;

public class ClientStatusUpdateRequest
{
    public bool IsActive { get; set; }
}

public class PaginatedResponse<T>
{
    public IEnumerable<T> Items { get; set; } = Enumerable.Empty<T>();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / (PageSize > 0 ? PageSize : 10));
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;
}

public class DuplicateWarningResponse
{
    public bool IsDuplicate { get; set; } = true;
    public string Message { get; set; } = string.Empty;
    public ClientDto ExistingClient { get; set; } = null!;
}

